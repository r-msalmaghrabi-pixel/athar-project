(function () {

    "use strict";

    const Core = window.AtharCore || {};

    const grid =
        document.getElementById("classification-grid");

    const select =
        document.getElementById("classification-select");

    const result =
        document.getElementById("classification-result");


    // ==========================================
    // مستويات تصنيف البيانات
    // الأمثلة توضيحية لتسهيل فهم مستوى الأثر
    // ==========================================

    const DATA_CLASSIFICATION_LEVELS = {

        "top-secret": {
            label: "سري للغاية",
            tone: "danger",
            impactTitle: "أثر بالغ على الدولة",
            description:
                "يُستخدم عندما قد يؤدي الإفصاح غير المصرح به إلى ضرر بالغ يمس الدولة أو مصالحها أو أمنها أو سمعتها.",
            example:
                "معلومات قد يؤدي كشفها إلى الإضرار بأمن الدولة أو مصالحها أو سمعتها.",
            controls: [
                "قصر الوصول على المستخدمين المخولين فقط.",
                "اشتراط موافقة إضافية قبل الوصول.",
                "منع التنزيل أو التصدير المباشر عند الحاجة.",
                "تسجيل ومراجعة جميع عمليات الوصول."
            ]
        },

        "secret": {
            label: "سري",
            tone: "danger",
            impactTitle: "أثر كبير على الجهة",
            description:
                "يُستخدم عندما قد يؤدي الإفصاح غير المصرح به إلى ضرر كبير على الجهة أو أعمالها أو مشاريعها أو مصالحها.",
            example:
                "تفاصيل مشروع مهم أو عقد أو خطة داخلية غير معلنة قد يسبب كشفها خسارة أو ضررًا للجهة.",
            controls: [
                "التحقق المشدد من صلاحية المستخدم.",
                "قصر الوصول على الفئات المرتبطة بالغرض.",
                "تقييد التنزيل والتصدير.",
                "تسجيل عمليات الوصول ومراجعتها."
            ]
        },

        "restricted": {
            label: "مقيد",
            tone: "warning",
            impactTitle: "إتاحة محدودة لفئات محددة",
            description:
                "يُستخدم للبيانات غير المتاحة للعامة والتي يقتصر الاطلاع عليها على مستخدمين محددين وفق الصلاحيات والغرض.",
            example:
                "بيانات الموظفين الداخلية أو بيانات العملاء التي يحتاج إليها موظفون محددون لأداء مهامهم.",
            controls: [
                "التحقق من الصلاحية قبل الإتاحة.",
                "التحقق من الغرض من الوصول.",
                "تطبيق الحد الأدنى من الصلاحيات.",
                "تسجيل عمليات الوصول."
            ]
        },

        "public": {
            label: "عام",
            tone: "success",
            impactTitle: "متاح للنشر العام",
            description:
                "يُستخدم للبيانات المعتمدة للإتاحة أو النشر والتي لا يترتب على الإفصاح عنها أثر يستوجب تقييد الوصول.",
            example:
                "معلومات الخدمات أو التقارير والإحصاءات التي اعتمدت الجهة نشرها للجمهور.",
            controls: [
                "التحقق من اعتماد البيانات للنشر العام.",
                "عدم اعتبار البيانات الشخصية قابلة للنشر تلقائيًا.",
                "تطبيق متطلبات حماية البيانات الشخصية عند انطباقها."
            ]
        }

    };


    function escapeHTML(value) {

        if (
            Core &&
            typeof Core.escapeHTML === "function"
        ) {
            return Core.escapeHTML(value);
        }

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    // ==========================================
    // بطاقات المستويات
    // ==========================================

    function renderCards() {

        if (!grid) return;

        grid.innerHTML =
            Object.entries(DATA_CLASSIFICATION_LEVELS)
                .map(([key, info]) => `

                    <article
                        class="classification-level-card classification-level-${escapeHTML(key)}"
                        data-level="${escapeHTML(key)}"
                    >

                        <div class="classification-level-head">

                            <span
                                class="protection-badge protection-tone-${escapeHTML(info.tone)}"
                            >
                                ${escapeHTML(info.label)}
                            </span>

                            <h3>
                                ${escapeHTML(info.label)}
                            </h3>

                        </div>


                        <div class="classification-impact">

                            <span>
                                مستوى الأثر
                            </span>

                            <strong>
                                ${escapeHTML(info.impactTitle)}
                            </strong>

                        </div>


                        <p class="classification-level-description">
                            ${escapeHTML(info.description)}
                        </p>


                        <div class="classification-example">

                            <span>
                                مثال توضيحي
                            </span>

                            <p>
                                ${escapeHTML(info.example)}
                            </p>

                        </div>

                    </article>

                `)
                .join("");
    }


    // ==========================================
    // تفاصيل المستوى المحدد
    // ==========================================

    function renderSelected() {

        if (!select || !result) return;

        const info =
            DATA_CLASSIFICATION_LEVELS[
                select.value
            ];

        if (!info) return;

        result.innerHTML = `

            <div class="classification-selected-head">

                <div>
                    <span class="section-label">
                        المستوى المختار
                    </span>

                    <h3>
                        ${escapeHTML(info.label)}
                    </h3>
                </div>

                <span
                    class="protection-badge protection-tone-${escapeHTML(info.tone)}"
                >
                    ${escapeHTML(info.label)}
                </span>

            </div>


            <div class="classification-selected-impact">
                ${escapeHTML(info.impactTitle)}
            </div>


            <p>
                ${escapeHTML(info.description)}
            </p>


            <div class="classification-example classification-example-large">

                <span>
                    مثال توضيحي
                </span>

                <p>
                    ${escapeHTML(info.example)}
                </p>

            </div>


            <h4>
                إجراءات الحماية في أثر
            </h4>

            <ul class="classification-controls-list">

                ${info.controls
                    .map(
                        item => `
                            <li>
                                ${escapeHTML(item)}
                            </li>
                        `
                    )
                    .join("")
                }

            </ul>


            <p class="classification-reference-note">
                الأمثلة المعروضة للتوضيح فقط.
                مستوى التصنيف الفعلي تحدده الجهة وفق سياسة تصنيف البيانات المعتمدة
                والآثار المترتبة على الإفصاح عنها.
            </p>

        `;
    }


    if (select) {
        select.addEventListener(
            "change",
            renderSelected
        );
    }


    renderCards();
    renderSelected();

})();
