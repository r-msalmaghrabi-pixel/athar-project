(function () {
    "use strict";
    const Core = window.AtharCore;
    const grid = document.getElementById("default-policy-grid");
    const list = document.getElementById("custom-policy-list");
    const form = document.getElementById("custom-policy-form");

    function renderDefaults() {
        grid.innerHTML = Object.entries(Core.DEFAULT_POLICIES).map(([department, policy]) => `
            <article class="policy-detail-card">
                <div class="policy-detail-head"><h3>${Core.escapeHTML(department)}</h3><span>قاعدة افتراضية</span></div>
                <div class="policy-detail-block"><strong>الأنظمة المسموح بها</strong><div>${policy.systems.map(item => `<span class="policy-system-tag">${Core.escapeHTML(item)}</span>`).join("")}</div></div>
                <div class="policy-detail-block"><strong>أنواع البيانات</strong><div>${policy.dataTypes.length ? policy.dataTypes.map(item => `<span class="policy-system-tag">${Core.escapeHTML(item)}</span>`).join("") : `<span class="policy-system-tag">لا يوجد وصول مباشر إلى محتوى البيانات</span>`}</div></div>
                <div class="policy-detail-block"><strong>العمليات</strong><div>${policy.actions.map(action => `<span class="policy-system-tag">${Core.escapeHTML(Core.ACTION_LABELS[action] || action)}</span>`).join("")}</div></div>
            </article>`).join("");
    }

    function renderCustom() {
        const rules = Core.getCustomPolicies();
        if (!rules.length) {
            list.innerHTML = `<div class="policy-empty"><h3>لا توجد قواعد مخصصة</h3><p>عند إضافة قاعدة جديدة ستظهر هنا ويمكن حذفها لاحقًا.</p></div>`;
            return;
        }

        list.innerHTML = rules.map((rule, index) => `
            <article class="custom-policy-item">
                <div>
                    <strong>${Core.escapeHTML(rule.department)}</strong>
                    <p>${Core.escapeHTML(rule.dataType)} — ${Core.escapeHTML(Core.ACTION_LABELS[rule.action] || rule.action)} — الحد: ${Number(rule.maxRecords) || 0} سجل</p>
                </div>
                <div class="custom-policy-actions">
                    <span class="protection-badge protection-tone-${Core.DECISIONS[rule.decision]?.tone || "neutral"}">${Core.escapeHTML(Core.DECISIONS[rule.decision]?.label || rule.decision)}</span>
                    <button type="button" class="secondary-btn compact-button" data-delete="${index}">حذف</button>
                </div>
            </article>`).join("");
    }

    form.addEventListener("submit", event => {
        event.preventDefault();
        const rule = Object.fromEntries(new FormData(form).entries());
        rule.maxRecords = Number(rule.maxRecords) || 0;
        const rules = Core.getCustomPolicies();
        rules.push(rule);
        Core.setCustomPolicies(rules);
        renderCustom();
    });

    list.addEventListener("click", event => {
        const button = event.target.closest("[data-delete]");
        if (!button) return;
        const rules = Core.getCustomPolicies();
        rules.splice(Number(button.dataset.delete), 1);
        Core.setCustomPolicies(rules);
        renderCustom();
    });

    renderDefaults();
    renderCustom();
})();
