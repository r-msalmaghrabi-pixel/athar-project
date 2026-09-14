(function () {
    "use strict";
    const Core = window.AtharCore;
    const logBox = document.getElementById("protection-log");
    const casesBox = document.getElementById("detected-cases");
    const filter = document.getElementById("decision-filter");
    const search = document.getElementById("log-search");
    const clearButton = document.getElementById("clear-log");

    function refreshStats() {
        const log = Core.getProtectionLog();
        document.getElementById("stat-log").textContent = log.length;
        document.getElementById("stat-denied").textContent = log.filter(item => item.decision === "denied").length;
        document.getElementById("stat-cases").textContent = Core.getDetectedCases().length;
        document.getElementById("stat-incidents").textContent = Core.getIncidents().length;
    }

    function decisionClass(decision) {
        return `protection-tone-${Core.DECISIONS[decision]?.tone || "neutral"}`;
    }

    function renderLog() {
        const query = search.value.trim().toLowerCase();
        const decision = filter.value;
        let items = Core.getProtectionLog();
        items = items.filter(item => decision === "all" || item.decision === decision);
        if (query) {
            items = items.filter(item => `${item.request.userId} ${item.request.department} ${item.request.dataType} ${item.request.system}`.toLowerCase().includes(query));
        }

        if (!items.length) {
            logBox.innerHTML = `<div class="reviews-empty"><h3>لا توجد نتائج مطابقة</h3><p>نفذ طلب وصول من مركز الحماية ليظهر القرار في هذا السجل.</p></div>`;
            return;
        }

        logBox.innerHTML = `<div class="protection-table-wrap"><table class="protection-table"><thead><tr><th>الوقت</th><th>المستخدم</th><th>الطلب</th><th>القرار</th><th>التفاصيل</th></tr></thead><tbody>${items.map(item => `
            <tr>
                <td>${Core.escapeHTML(Core.formatDate(item.createdAt))}</td>
                <td>${Core.escapeHTML(item.request.userId)}<small>${Core.escapeHTML(item.request.department)}</small></td>
                <td>${Core.escapeHTML(item.request.dataType)}<small>${Core.escapeHTML(Core.ACTION_LABELS[item.request.action] || item.request.action)} — ${Core.escapeHTML(item.request.system)}</small></td>
                <td><span class="protection-badge ${decisionClass(item.decision)}">${Core.escapeHTML(item.decisionMeta?.label || item.decision)}</span></td>
                <td><a class="review-case-btn" href="case.html?type=log&id=${encodeURIComponent(item.id)}">عرض التفاصيل</a></td>
            </tr>`).join("")}</tbody></table></div>`;
    }

    function renderCases() {
        const items = Core.getDetectedCases();
        if (!items.length) {
            casesBox.innerHTML = `<div class="reviews-empty"><h3>لا توجد حالات مرصودة</h3><p>ارفع ملف CSV من مركز الحماية لإجراء تحليل لسجل النشاط.</p></div>`;
            return;
        }

        casesBox.innerHTML = `<div class="protection-table-wrap"><table class="protection-table"><thead><tr><th>المعرف</th><th>المستخدم</th><th>النشاط</th><th>قرار الحماية</th><th>الاختلافات</th><th>التفاصيل</th></tr></thead><tbody>${items.map(item => `
            <tr>
                <td>${Core.escapeHTML(item.id)}</td>
                <td>${Core.escapeHTML(item.row.user_id)}<small>${Core.escapeHTML(item.row.department)}</small></td>
                <td>${Core.escapeHTML(item.row.data_type)}<small>${Core.escapeHTML(Core.ACTION_LABELS[String(item.row.action).toUpperCase()] || item.row.action)} — ${Number(item.row.record_count) || 0} سجل</small></td>
                <td><span class="protection-badge ${decisionClass(item.protection.decision)}">${Core.escapeHTML(item.protection.decisionMeta.label)}</span></td>
                <td>${Core.escapeHTML(item.anomaly.length ? item.anomaly.join(" — ") : "حالة ناتجة عن سياسة الحماية")}</td>
                <td><a class="review-case-btn" href="case.html?type=csv&id=${encodeURIComponent(item.id)}">عرض التفاصيل</a></td>
            </tr>`).join("")}</tbody></table></div>`;
    }

    filter.addEventListener("change", renderLog);
    search.addEventListener("input", renderLog);
    clearButton.addEventListener("click", () => {
        if (window.confirm("هل تريد مسح سجل قرارات الحماية المحفوظ محليًا؟")) {
            Core.clearProtectionLog();
            renderLog();
            refreshStats();
        }
    });

    renderLog();
    renderCases();
    refreshStats();
})();
