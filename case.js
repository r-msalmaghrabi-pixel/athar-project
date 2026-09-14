(function () {
    "use strict";
    const Core = window.AtharCore;
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type") || "log";
    const id = params.get("id") || "";
    const box = document.getElementById("case-content");

    if (!id) {
        box.innerHTML = `
            <div class="reviews-empty">
                <h3>لا توجد حالة داخلية محددة</h3>
                <p>الحالة التنظيمية الموثقة معروضة أعلاه. لعرض قرار داخلي من أثر، افتح هذه الصفحة من سجل الحماية.</p>
            </div>`;
        return;
    }

    const item = type === "csv"
        ? Core.getDetectedCases().find(record => record.id === id)
        : Core.getProtectionLog().find(record => record.id === id);

    if (!item) {
        box.innerHTML = `<div class="reviews-empty"><h2>تعذر العثور على الحالة</h2><p>قد يكون السجل قد حُذف من التخزين المحلي للمتصفح.</p></div>`;
        return;
    }

    const protection = type === "csv" ? item.protection : item;
    const request = protection.request;
    const toneClass = `protection-tone-${protection.decisionMeta?.tone || "neutral"}`;

    box.innerHTML = `
        <div class="case-review-header">
            <div>
                <span class="section-label">${Core.escapeHTML(type === "csv" ? item.id : protection.id)}</span>
                <h2>${Core.escapeHTML(protection.decisionMeta.label)}</h2>
            </div>
            <span class="protection-badge ${toneClass}">${Core.escapeHTML(protection.classification.label)}</span>
        </div>
        <div class="case-review-grid">
            <div><small>المستخدم</small><strong>${Core.escapeHTML(request.userId)}</strong><span>${Core.escapeHTML(request.department)}</span></div>
            <div><small>البيانات</small><strong>${Core.escapeHTML(request.dataType)}</strong><span>${Core.escapeHTML(request.system)}</span></div>
            <div><small>العملية</small><strong>${Core.escapeHTML(Core.ACTION_LABELS[request.action] || request.action)}</strong><span>${Number(request.recordCount) || 0} سجل</span></div>
        </div>
        <div class="case-reasons"><span>أسباب قرار الحماية</span><ul>${protection.reasons.map(reason => `<li>${Core.escapeHTML(reason)}</li>`).join("")}</ul></div>
        ${type === "csv" ? `<div class="case-reasons"><span>الاختلافات السلوكية</span><ul>${item.anomaly.length ? item.anomaly.map(reason => `<li>${Core.escapeHTML(reason)}</li>`).join("") : `<li>لم يظهر اختلاف سلوكي إضافي؛ الحالة ناتجة عن سياسة الحماية.</li>`}</ul></div>` : ""}
        <div class="case-reasons"><span>إجراءات الحماية</span><ul>${protection.controls.map(control => `<li>${Core.escapeHTML(control)}</li>`).join("")}</ul></div>`;
})();
