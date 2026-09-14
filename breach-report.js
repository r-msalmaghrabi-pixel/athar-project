(function () {
    "use strict";
    const Core = window.AtharCore;
    const form = document.getElementById("incident-form");
    const list = document.getElementById("incident-list");
    const dateInput = form.elements.discoveredAt;

    function setCurrentDate() {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        dateInput.value = now.toISOString().slice(0, 16);
    }

    function priorityClass(priority) {
        if (priority === "عالية") return "protection-tone-danger";
        if (priority === "متوسطة") return "protection-tone-warning";
        return "protection-tone-success";
    }

    function render() {
        const items = Core.getIncidents();
        if (!items.length) {
            list.innerHTML = `<div class="reviews-empty"><h3>لا توجد حوادث مسجلة</h3><p>عند حفظ بلاغ جديد سيظهر في هذا السجل.</p></div>`;
            return;
        }

        list.innerHTML = items.map(item => `
            <article class="incident-item">
                <div class="incident-item-head">
                    <div><strong>${Core.escapeHTML(item.id)}</strong><p>${Core.escapeHTML(item.dataType)} — ${Number(item.recordCount) || 0} سجل</p></div>
                    <span class="protection-badge ${priorityClass(item.priority)}">${Core.escapeHTML(item.priority)}</span>
                </div>
                <p>${Core.escapeHTML(item.description)}</p>
                <div class="incident-meta"><span>الحالة: ${Core.escapeHTML(item.status)}</span><span>الاكتشاف: ${Core.escapeHTML(item.discoveredAt || "—")}</span></div>
                <div class="protection-form-actions">
                    ${item.status !== "قيد المعالجة" && item.status !== "مغلق" ? `<button class="secondary-btn compact-button" type="button" data-status="قيد المعالجة" data-id="${Core.escapeHTML(item.id)}">بدء المعالجة</button>` : ""}
                    ${item.status !== "مغلق" ? `<button class="secondary-btn compact-button" type="button" data-status="مغلق" data-id="${Core.escapeHTML(item.id)}">إغلاق الحادثة</button>` : ""}
                </div>
            </article>`).join("");
    }

    form.addEventListener("submit", event => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        data.recordCount = Number(data.recordCount) || 0;
        Core.addIncident(data);
        form.reset();
        setCurrentDate();
        render();
    });

    list.addEventListener("click", event => {
        const button = event.target.closest("[data-status]");
        if (!button) return;
        const items = Core.getIncidents();
        const item = items.find(record => record.id === button.dataset.id);
        if (!item) return;
        item.status = button.dataset.status;
        item.updatedAt = new Date().toISOString();
        Core.setIncidents(items);
        render();
    });

    setCurrentDate();
    render();
})();
