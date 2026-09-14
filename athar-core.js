(function () {
    "use strict";

    const STORAGE_KEYS = {
        protectionLog: "atharProtectionLogV3",
        customPolicies: "atharCustomPoliciesV3",
        incidents: "atharIncidentsV3",
        detectedCases: "atharDetectedCasesV3",
        lastCSV: "atharLastCSVV3"
    };

    const DATA_TYPES = {
        "بيانات الموظفين": {
            level: "personal",
            label: "بيانات شخصية",
            description: "بيانات تعريفية ووظيفية مرتبطة بالموظف.",
            controls: ["إخفاء الحقول غير اللازمة", "التحقق من الغرض", "تسجيل عمليات الوصول"]
        },
        "رقم الهوية": {
            level: "personal",
            label: "بيانات شخصية",
            description: "مُعرّف مباشر للشخص ويُراعى تقليل ظهوره عند عدم الحاجة إلى القيمة الكاملة.",
            controls: ["إخفاء جزئي", "التحقق من الحاجة", "تسجيل عمليات الوصول"]
        },
        "بيانات التواصل": {
            level: "personal",
            label: "بيانات شخصية",
            description: "بيانات مرتبطة بالشخص مثل رقم الجوال والبريد الإلكتروني.",
            controls: ["إخفاء جزئي عند العرض", "التحقق من الغرض", "تسجيل عمليات الوصول"]
        },
        "بيانات مالية": {
            level: "personal",
            label: "بيانات شخصية",
            description: "بيانات مالية مرتبطة بالشخص وتُعرض فقط بالقدر اللازم للغرض.",
            controls: ["إخفاء القيم غير اللازمة", "التحقق من الغرض", "تسجيل عمليات الوصول"]
        },
        "بيانات العملاء": {
            level: "personal",
            label: "بيانات شخصية",
            description: "بيانات تعريفية وتشغيلية مرتبطة بالعملاء أو المستفيدين.",
            controls: ["تقليل البيانات المعروضة", "التحقق من الغرض", "تسجيل عمليات الوصول"]
        },
        "بيانات صحية": {
            level: "personal",
            label: "بيانات شخصية",
            description: "بيانات صحية مرتبطة بالشخص ويُراعى عدم كشف محتواها إلا ضمن الصلاحية والغرض.",
            controls: ["إخفاء المحتوى غير الضروري", "التحقق من الصلاحية", "تسجيل عمليات الوصول"]
        },
        "بيانات حيوية أو بيومترية": {
            level: "personal",
            label: "بيانات شخصية",
            description: "بيانات حيوية أو بيومترية مرتبطة بالشخص ولا تُعرض قيمتها الخام في النموذج.",
            controls: ["عدم إظهار القيمة الخام", "التحقق من الصلاحية", "تسجيل عمليات الوصول"]
        },
        "بيانات الموقع الجغرافي": {
            level: "personal",
            label: "بيانات شخصية",
            description: "بيانات موقع قد تكشف مكان الشخص أو تحركاته ويُراعى تقليل التفاصيل غير اللازمة.",
            controls: ["تقليل دقة الموقع", "التحقق من الغرض", "تسجيل عمليات الوصول"]
        },
        "بيانات تعليمية": {
            level: "personal",
            label: "بيانات شخصية",
            description: "بيانات مرتبطة بالطالب مثل التخصص والمعدل والحالة الأكاديمية.",
            controls: ["إخفاء القيم غير اللازمة", "التحقق من الغرض", "تسجيل عمليات الوصول"]
        }
    };

    const DEFAULT_POLICIES = {
        "الموارد البشرية": {
            systems: ["HR_System", "Payroll_System"],
            dataTypes: ["بيانات الموظفين", "رقم الهوية", "بيانات التواصل", "بيانات مالية"],
            actions: ["VIEW", "UPDATE", "DOWNLOAD"],
            maxRecords: { VIEW: 120, UPDATE: 30, DOWNLOAD: 40, EXPORT: 0, DELETE: 0 }
        },
        "المالية": {
            systems: ["Finance_System", "Payroll_System"],
            dataTypes: ["بيانات مالية", "رقم الهوية", "بيانات الموظفين", "بيانات العملاء"],
            actions: ["VIEW", "UPDATE", "EXPORT"],
            maxRecords: { VIEW: 150, UPDATE: 40, DOWNLOAD: 0, EXPORT: 50, DELETE: 0 }
        },
        "التسويق": {
            systems: ["CRM_System"],
            dataTypes: ["بيانات العملاء", "بيانات التواصل"],
            actions: ["VIEW", "EXPORT"],
            maxRecords: { VIEW: 250, UPDATE: 0, DOWNLOAD: 0, EXPORT: 100, DELETE: 0 }
        },
        "تقنية المعلومات": {
            systems: ["Admin_System", "DPO_System"],
            dataTypes: [],
            actions: ["VIEW"],
            maxRecords: { VIEW: 10, UPDATE: 0, DOWNLOAD: 0, EXPORT: 0, DELETE: 0 }
        },
        "الخصوصية والالتزام": {
            systems: ["DPO_System", "HR_System", "Finance_System", "CRM_System", "Health_System"],
            dataTypes: Object.keys(DATA_TYPES),
            actions: ["VIEW"],
            maxRecords: { VIEW: 80, UPDATE: 0, DOWNLOAD: 0, EXPORT: 0, DELETE: 0 }
        },
        "الصحة المهنية": {
            systems: ["Health_System"],
            dataTypes: ["بيانات صحية", "بيانات الموظفين", "رقم الهوية"],
            actions: ["VIEW", "UPDATE", "DOWNLOAD"],
            maxRecords: { VIEW: 60, UPDATE: 20, DOWNLOAD: 15, EXPORT: 0, DELETE: 0 }
        }
    };

    const ACTION_LABELS = {
        VIEW: "عرض",
        UPDATE: "تعديل",
        DOWNLOAD: "تنزيل",
        EXPORT: "تصدير",
        DELETE: "حذف"
    };

    const DECISIONS = {
        allowed: { label: "مسموح", tone: "success", icon: "✓" },
        masked: { label: "مسموح مع إخفاء جزئي", tone: "info", icon: "◐" },
        approval: { label: "يتطلب موافقة", tone: "warning", icon: "!" },
        denied: { label: "مرفوض", tone: "danger", icon: "×" }
    };

    function readJSON(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function writeJSON(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function uid(prefix) {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function classifyData(dataType) {
        return DATA_TYPES[dataType] || {
            level: "personal",
            label: "بيانات شخصية",
            description: "نوع بيانات غير مسجل في دليل أثر ويُعامل كبيانات شخصية إلى أن تحدد الجهة وصفه المناسب.",
            controls: ["التحقق من الصلاحية", "تحديد الغرض", "تسجيل الوصول"]
        };
    }

    function getCustomPolicies() {
        return readJSON(STORAGE_KEYS.customPolicies, []);
    }

    function setCustomPolicies(rules) {
        writeJSON(STORAGE_KEYS.customPolicies, rules);
    }

    function findCustomPolicy(request) {
        return getCustomPolicies()
            .slice()
            .reverse()
            .find(rule =>
                rule.department === request.department &&
                rule.dataType === request.dataType &&
                rule.action === request.action
            );
    }

    function strongerDecision(current, candidate) {
        const rank = { allowed: 0, masked: 1, approval: 2, denied: 3 };
        return rank[candidate] > rank[current] ? candidate : current;
    }

    function evaluateAccess(input, options = {}) {
        const request = {
            userId: String(input.userId || input.user_id || "غير محدد").trim(),
            department: String(input.department || "").trim(),
            system: String(input.system || "").trim(),
            dataType: String(input.dataType || input.data_type || "").trim(),
            action: String(input.action || "VIEW").trim().toUpperCase(),
            recordCount: Math.max(0, Number(input.recordCount ?? input.record_count ?? 0) || 0),
            purpose: String(input.purpose || "").trim(),
            source: options.source || "manual"
        };

        const classification = classifyData(request.dataType);
        const reasons = [];
        const controls = [];
        let decision = "allowed";

        if (!request.department || !request.system || !request.dataType || !request.action) {
            decision = "denied";
            reasons.push("بيانات طلب الوصول غير مكتملة؛ لذلك تعذر التحقق من الصلاحية.");
        }

        if (options.requirePurpose !== false && !request.purpose) {
            decision = "denied";
            reasons.push("لم يُحدَّد غرض واضح للوصول إلى البيانات الشخصية.");
        }

        const custom = findCustomPolicy(request);
        if (custom && decision !== "denied") {
            decision = custom.decision;
            reasons.push("طُبقت قاعدة وصول مخصصة محفوظة في سياسة أثر.");
            if (Number(custom.maxRecords) > 0 && request.recordCount > Number(custom.maxRecords)) {
                decision = strongerDecision(decision, "approval");
                reasons.push("عدد السجلات يتجاوز الحد المحدد في قاعدة الوصول المخصصة.");
            }
        }

        if (!custom && decision !== "denied") {
            const policy = DEFAULT_POLICIES[request.department];

            if (!policy) {
                decision = "denied";
                reasons.push("الإدارة غير معرفة ضمن سياسة الوصول التجريبية في أثر.");
            } else if (!policy.systems.includes(request.system)) {
                decision = "denied";
                reasons.push("النظام المطلوب غير مدرج ضمن الأنظمة المسموح بها لهذه الإدارة.");
            } else if (!policy.dataTypes.includes(request.dataType)) {
                if (request.department === "الخصوصية والالتزام" && request.action === "VIEW") {
                    decision = "approval";
                    reasons.push("نوع البيانات خارج نطاق الوصول المعتاد لهذه الإدارة ويتطلب موافقة قبل الاطلاع.");
                } else {
                    decision = "denied";
                    reasons.push("نوع البيانات غير مصرح لهذه الإدارة بالوصول إليه.");
                }
            } else if (!policy.actions.includes(request.action)) {
                decision = request.action === "DELETE" ? "approval" : "denied";
                reasons.push(request.action === "DELETE"
                    ? "عملية الحذف لا تُنفذ مباشرة في النموذج وتتطلب موافقة مستقلة."
                    : "نوع العملية غير مسموح لهذه الإدارة.");
            } else {
                const max = Number(policy.maxRecords[request.action] || 0);
                if (max > 0 && request.recordCount > max * 5) {
                    decision = "denied";
                    reasons.push("حجم الطلب يتجاوز الحد التشغيلي بدرجة كبيرة؛ لذلك حُجب الوصول.");
                } else if (max > 0 && request.recordCount > max) {
                    decision = "approval";
                    reasons.push("عدد السجلات يتجاوز الحد التشغيلي ويستلزم موافقة إضافية.");
                }
            }
        }

        /*
         * نوع البيانات المكتشف لا يمنح الصلاحية ولا يرفع أو يخفض القرار
         * بترتيب ثابت. قرار الوصول يعتمد على سياسة الوصول والسياق،
         * بينما نوع البيانات يحدد طريقة الإخفاء والحماية فقط.
         */

        if (reasons.length === 0) {
            reasons.push("الطلب يقع ضمن الصلاحيات والحدود التشغيلية المعرفة في نموذج أثر.");
        }

        if (decision === "masked") {
            controls.push("إخفاء الحقول أو أجزاء القيم غير الضرورية قبل العرض.");
        }
        if (decision === "approval") {
            controls.push("عدم إتاحة البيانات قبل اعتماد الطلب من مسؤول مخول.");
        }
        if (decision === "denied") {
            controls.push("حجب الوصول وعدم عرض البيانات للمستخدم.");
        }
        controls.push("تسجيل قرار الحماية وأسبابه في سجل أثر.");

        return {
            id: uid("APR"),
            createdAt: new Date().toISOString(),
            request,
            classification,
            decision,
            decisionMeta: DECISIONS[decision],
            reasons,
            controls
        };
    }

    function getProtectionLog() {
        return readJSON(STORAGE_KEYS.protectionLog, []);
    }

    function saveProtectionEvent(result) {
        const log = getProtectionLog();
        log.unshift(result);
        writeJSON(STORAGE_KEYS.protectionLog, log.slice(0, 250));
        return result;
    }

    function clearProtectionLog() {
        localStorage.removeItem(STORAGE_KEYS.protectionLog);
    }

    function getIncidents() {
        return readJSON(STORAGE_KEYS.incidents, []);
    }

    function setIncidents(items) {
        writeJSON(STORAGE_KEYS.incidents, items);
    }

    function addIncident(item) {
        const incidents = getIncidents();
        const incident = {
            id: uid("INC"),
            createdAt: new Date().toISOString(),
            status: "مفتوح",
            ...item
        };
        incidents.unshift(incident);
        setIncidents(incidents.slice(0, 200));
        return incident;
    }

    function getDetectedCases() {
        return readJSON(STORAGE_KEYS.detectedCases, []);
    }

    function setDetectedCases(items) {
        writeJSON(STORAGE_KEYS.detectedCases, items);
    }

    function maskSample(dataType) {
        const samples = {
            "بيانات الموظفين": [
                ["الاسم", "مـــــ***"],
                ["الرقم الوظيفي", "EMP-***42"],
                ["الإدارة", "الموارد البشرية"]
            ],
            "رقم الهوية": [["رقم الهوية", "10••••••89"]],
            "بيانات التواصل": [["رقم الجوال", "05• ••• ••21"], ["البريد الإلكتروني", "m***@example.sa"]],
            "بيانات مالية": [["رقم الحساب", "SA•• •••• •••• 4421"], ["القيمة", "•••• ريال"]],
            "بيانات العملاء": [["اسم العميل", "ع*** م***"], ["رقم العميل", "C-***17"]],
            "بيانات صحية": [["رقم الملف الصحي", "••••••42"], ["التشخيص", "••••••"]],
            "بيانات حيوية أو بيومترية": [["القالب الحيوي", "غير متاح للعرض"]],
            "بيانات الموقع الجغرافي": [["الموقع", "الرياض — دقة مخفضة"]],
            "بيانات تعليمية": [["التخصص", "••••••"], ["المعدل", "••••••"]]
        };
        return samples[dataType] || [["القيمة", "••••••••"]];
    }

    function formatDate(iso) {
        try {
            return new Intl.DateTimeFormat("ar-SA", {
                dateStyle: "medium",
                timeStyle: "short"
            }).format(new Date(iso));
        } catch (error) {
            return iso;
        }
    }


    function removeAngleQuoteMarks(root) {
        if (!root) return;

        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT
        );

        const nodes = [];
        while (walker.nextNode()) {
            nodes.push(walker.currentNode);
        }

        nodes.forEach(node => {
            if (node.nodeValue && /[«»]/.test(node.nodeValue)) {
                node.nodeValue = node.nodeValue.replace(/[«»]/g, "");
            }
        });
    }

    function cleanVisibleAngleQuotes() {
        removeAngleQuoteMarks(document.body);
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            cleanVisibleAngleQuotes,
            { once: true }
        );
    } else {
        cleanVisibleAngleQuotes();
    }

    window.AtharCore = {
        STORAGE_KEYS,
        DATA_TYPES,
        DEFAULT_POLICIES,
        ACTION_LABELS,
        DECISIONS,
        classifyData,
        evaluateAccess,
        getCustomPolicies,
        setCustomPolicies,
        getProtectionLog,
        saveProtectionEvent,
        clearProtectionLog,
        getIncidents,
        setIncidents,
        addIncident,
        getDetectedCases,
        setDetectedCases,
        maskSample,
        escapeHTML,
        formatDate,
        uid
    };
})();
