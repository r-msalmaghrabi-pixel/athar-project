(function () {
    "use strict";

    const Core = window.AtharCore;

    const fileInput =
        document.getElementById("activity-file");

    const csvMessage =
        document.getElementById("csv-message");

    const resultsSection =
        document.getElementById("analysis-results");


    // ==========================================
    // اختيار ملف CSV
    // ==========================================

    if (fileInput) {

        fileInput.addEventListener("change", function () {

            const file = fileInput.files[0];

            if (!file) {
                return;
            }

            if (!file.name.toLowerCase().endsWith(".csv")) {
                csvMessage.textContent =
                    "يرجى اختيار ملف بصيغة CSV للمتابعة.";
                fileInput.value = "";
                return;
            }

            const reader = new FileReader();

            reader.onload = function (event) {
                processLogCSV(event.target.result);
            };

            reader.readAsText(file);

        });

    }


    // ==========================================
    // معالجة ملف السجل
    // ==========================================

    function processLogCSV(csvText) {

        csvMessage.textContent = "";

        if (!csvText || !csvText.trim()) {
            csvMessage.textContent = "الملف فارغ.";
            return;
        }

        const lines =
            csvText.trim().split(/\r?\n/);

        if (lines.length < 2) {
            csvMessage.textContent =
                "الملف لا يحتوي على بيانات كافية.";
            return;
        }

        const headers =
            lines[0]
                .replace(/^\uFEFF/, "")
                .split(",")
                .map(item => item.trim());

        const requiredColumns = [
            "timestamp",
            "user_id",
            "department",
            "system",
            "data_type",
            "action",
            "record_count"
        ];

        const missingColumns =
            requiredColumns.filter(
                column => !headers.includes(column)
            );

        if (missingColumns.length > 0) {
            csvMessage.textContent =
                "الملف ناقص الأعمدة التالية: " +
                missingColumns.join("، ");
            return;
        }

        const rows =
            lines
                .slice(1)
                .filter(line => line.trim() !== "")
                .map(line => line.split(",").map(item => item.trim()));

        if (rows.length === 0) {
            csvMessage.textContent =
                "الملف لا يحتوي على سجلات نشاط.";
            return;
        }

        const idx = {};
        requiredColumns.forEach(
            column => { idx[column] = headers.indexOf(column); }
        );

        const activities =
            rows.map(row => ({
                timestamp: row[idx.timestamp],
                user_id: row[idx.user_id],
                department: row[idx.department],
                system: row[idx.system],
                data_type: row[idx.data_type],
                action: row[idx.action],
                record_count: Number(row[idx.record_count])
            }));

        const validActivities =
            activities.filter(
                activity => parseTimestamp(activity.timestamp) !== null
            );

        if (validActivities.length === 0) {
            csvMessage.textContent =
                "تعذر قراءة تواريخ الأنشطة في الملف.";
            return;
        }

        csvMessage.textContent =
            "تم التحقق من الملف وقراءة البيانات بنجاح.";

        analyzeLog(validActivities);

    }


    // ==========================================
    // تحويل نص الوقت إلى Date
    // ==========================================

    function parseTimestamp(timestamp) {

        if (!timestamp) {
            return null;
        }

        const parts = timestamp.trim().split(/\s+/);
        const datePart = parts[0];
        const timePart = parts[1] || "00:00";

        const dateParts = datePart.split("-").map(Number);
        const timeParts = timePart.split(":").map(Number);

        if (dateParts.length !== 3 || dateParts.some(Number.isNaN)) {
            return null;
        }

        const [year, month, day] = dateParts;
        const hour = timeParts[0] || 0;
        const minute = timeParts[1] || 0;

        const date = new Date(year, month - 1, day, hour, minute);

        return Number.isNaN(date.getTime()) ? null : date;

    }

    function getDateOnly(timestamp) {
        if (!timestamp) return "";
        return timestamp.trim().split(/\s+/)[0];
    }

    function getHour(timestamp) {
        const date = parseTimestamp(timestamp);
        return date ? date.getHours() : null;
    }

    function median(numbers) {
        if (!numbers.length) return 0;
        const sorted = [...numbers].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
    }

    function volumeLimit(counts) {
        if (!counts.length) return Infinity;
        const med = median(counts);
        const deviations = counts.map(value => Math.abs(value - med));
        const mad = median(deviations);
        if (mad === 0) return Math.max(med * 3, med + 5);
        return med + (3 * mad);
    }


    // ==========================================
    // التحليل السلوكي + دمج محرك سياسة الحماية
    // ==========================================

    function analyzeLog(activities) {

        const dates =
            activities
                .map(activity => getDateOnly(activity.timestamp))
                .filter(Boolean)
                .sort();

        const latestDate = dates[dates.length - 1];
        const latestDateObj = new Date(latestDate + "T00:00:00");

        const baselineStart = new Date(latestDateObj);
        baselineStart.setDate(baselineStart.getDate() - 30);

        const historical =
            activities.filter(activity => {
                const d = new Date(getDateOnly(activity.timestamp) + "T00:00:00");
                return d < latestDateObj && d >= baselineStart;
            });

        const current =
            activities.filter(
                activity => getDateOnly(activity.timestamp) === latestDate
            );

        const baselines = {};

        historical.forEach(activity => {
            if (!baselines[activity.user_id]) {
                baselines[activity.user_id] = {
                    counts: [],
                    systems: new Set(),
                    dataTypes: new Set()
                };
            }
            const baseline = baselines[activity.user_id];
            if (!Number.isNaN(activity.record_count)) {
                baseline.counts.push(activity.record_count);
            }
            baseline.systems.add(activity.system);
            baseline.dataTypes.add(activity.data_type);
        });

        const detectedCases = [];
        let normalCount = 0;
        let caseSequence = 0;

        const datePrefix =
            latestDate.replace(/-/g, "");

        current.forEach((activity) => {

            const baseline = baselines[activity.user_id];
            const anomaly = [];

            if (baseline && baseline.counts.length >= 2) {

                const limit = volumeLimit(baseline.counts);

                if (activity.record_count > limit) {
                    anomaly.push(
                        "حجم الوصول أعلى بشكل واضح من النمط التاريخي لهذا المستخدم."
                    );
                }

                if (!baseline.systems.has(activity.system)) {
                    anomaly.push(
                        "تم الوصول إلى نظام لم يظهر ضمن الاستخدام التاريخي لهذا المستخدم."
                    );
                }

                if (!baseline.dataTypes.has(activity.data_type)) {
                    anomaly.push(
                        "نوع البيانات لم يظهر ضمن نمط الوصول التاريخي لهذا المستخدم."
                    );
                }

            }
            else {
                anomaly.push(
                    "لا يوجد تاريخ كافٍ لهذا المستخدم لبناء نمط وصول معتاد."
                );
            }

            const hour = getHour(activity.timestamp);

            if (hour !== null && (hour < 7 || hour >= 19)) {
                anomaly.push(
                    "تم تسجيل النشاط خارج نافذة ساعات العمل المعتادة."
                );
            }

            // ------------------------------------------
            // دمج نفس محرك سياسة الحماية المستخدم في
            // طلب الوصول اليدوي، لتقييم هذا الوصول
            // بأثر رجعي وفق نفس القواعد بالضبط
            // ------------------------------------------

            const protection =
                Core.evaluateAccess(
                    {
                        userId: activity.user_id,
                        department: activity.department,
                        system: activity.system,
                        dataType: activity.data_type,
                        action: activity.action,
                        recordCount: activity.record_count,
                        purpose: "مراجعة آلية بعد الوصول ضمن تحليل سجل النشاط."
                    },
                    { source: "log" }
                );

            const needsCase =
                anomaly.length > 0 ||
                protection.decision !== "allowed";

            if (needsCase) {

                caseSequence += 1;

                detectedCases.push({
                    id: `LOG-${datePrefix}-${String(caseSequence).padStart(2, "0")}`,
                    row: activity,
                    protection: protection,
                    anomaly: anomaly
                });

            }
            else {
                normalCount += 1;
            }

        });

        Core.setDetectedCases(detectedCases);

        renderResults(activities, current, detectedCases, normalCount, latestDate);

    }


    // ==========================================
    // عرض النتائج
    // ==========================================

    function renderResults(allActivities, current, detectedCases, normalCount, latestDate) {

        resultsSection.hidden = false;

        if (detectedCases.length === 0) {

            resultsSection.innerHTML = `
                <div class="analysis-empty">
                    <div class="analysis-icon safe">✓</div>
                    <div>
                        <span class="section-label">نتيجة التحليل</span>
                        <h2>لم يُرصد نشاط يحتاج إلى مراجعة</h2>
                        <p>
                            لم تظهر في نشاط ${Core.escapeHTML(latestDate)}
                            اختلافات أو مخالفات سياسة وفق عوامل الرصد الحالية،
                            من أصل ${current.length} عملية وصول بهذا اليوم.
                        </p>
                    </div>
                </div>
            `;

            return;

        }

        const itemsHTML =
            detectedCases
                .map((item, index) => {

                    const reasonsHTML =
                        item.anomaly
                            .map(reason => `<li>${Core.escapeHTML(reason)}</li>`)
                            .join("");

                    const toneClass =
                        `protection-tone-${item.protection.decisionMeta?.tone || "neutral"}`;

                    return `
                        <article class="detected-item">

                            <div class="detected-item-top">
                                <div>
                                    <span class="case-number">حالة ${index + 1}</span>
                                    <h3>نشاط يحتاج إلى مراجعة</h3>
                                </div>
                                <span class="protection-badge ${toneClass}">
                                    ${Core.escapeHTML(item.protection.decisionMeta.label)}
                                </span>
                            </div>

                            <div class="detected-details">

                                <div>
                                    <small>المستخدم</small>
                                    <strong>${Core.escapeHTML(item.row.user_id)}</strong>
                                </div>

                                <div>
                                    <small>الإدارة</small>
                                    <strong>${Core.escapeHTML(item.row.department)}</strong>
                                </div>

                                <div>
                                    <small>النظام</small>
                                    <strong>${Core.escapeHTML(item.row.system)}</strong>
                                </div>

                                <div>
                                    <small>نوع البيانات</small>
                                    <strong>${Core.escapeHTML(item.row.data_type)}</strong>
                                </div>

                                <div>
                                    <small>عدد السجلات</small>
                                    <strong>${Number(item.row.record_count) || 0}</strong>
                                </div>

                            </div>

                            <div class="detection-reason">
                                <span>أسباب المراجعة</span>
                                <ul>${reasonsHTML}</ul>
                            </div>

                            <a
                                class="review-case-btn"
                                href="case.html?type=csv&id=${encodeURIComponent(item.id)}"
                            >
                                مراجعة الحالة
                            </a>

                        </article>
                    `;

                })
                .join("");

        resultsSection.innerHTML = `

            <div class="analysis-heading">
                <span class="section-label">نتيجة التحليل</span>
                <h2>حالات تحتاج إلى مراجعة (${detectedCases.length})</h2>
                <p>
                    من أصل ${current.length} عملية وصول بتاريخ ${Core.escapeHTML(latestDate)}،
                    ${normalCount} عملية ضمن النمط الطبيعي، و${detectedCases.length}
                    تستدعي المراجعة (استنادًا لنفس محرك سياسة الحماية المستخدم
                    في طلب الوصول اليدوي، بالإضافة إلى الفروقات السلوكية عن
                    آخر 30 يومًا).
                </p>
            </div>

            <div class="detected-list">
                ${itemsHTML}
            </div>

        `;

    }

})();