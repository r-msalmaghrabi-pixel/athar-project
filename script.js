(function () {

    "use strict";


    const Core =
        window.AtharCore;


    if (!Core) {
        console.error("تعذر تحميل AtharCore.");
        return;
    }


    // =====================================================
    // حالة الملف الحالي
    // =====================================================

    let currentStep = 1;

    let selectedClassification = "";

    let uploadedAnalysis = null;



    // =====================================================
    // عناصر الصفحة
    // =====================================================

    const fileInput =
        document.getElementById(
            "personal-data-file"
        );


    const chooseFileButton =
        document.getElementById(
            "choose-personal-data-file"
        );


    const replaceFileButton =
        document.getElementById(
            "replace-file"
        );


    const dropzone =
        document.getElementById(
            "personal-data-dropzone"
        );


    const loadingBox =
        document.getElementById(
            "file-analysis-loading"
        );


    const analysisResult =
        document.getElementById(
            "file-analysis-result"
        );


    const analysisValidation =
        document.getElementById(
            "file-analysis-validation"
        );


    const continueButton =
        document.getElementById(
            "continue-to-protection"
        );


    const classificationInputs =
        document.querySelectorAll(
            'input[name="dataClassification"]'
        );


    const classificationValidation =
        document.getElementById(
            "classification-validation"
        );


    const form =
        document.getElementById(
            "access-request-form"
        );


    const emptyState =
        document.getElementById(
            "decision-empty"
        );


    const resultBox =
        document.getElementById(
            "decision-result"
        );


    // =====================================================
    // أنواع البيانات التي يستطيع أثر اكتشافها
    // =====================================================

    const DETECTION_RULES = [

        {
            type: "بيانات حيوية أو بيومترية",
            risk: 100,
            header: [
                "biometric",
                "fingerprint",
                "face_template",
                "facial",
                "iris",
                "retina",
                "بصمة",
                "بصمه",
                "بيومتري",
                "قزحية",
                "قزحيه"
            ],
            valueTests: []
        },

        {
            type: "بيانات صحية",
            risk: 95,
            header: [
                "health",
                "medical",
                "diagnosis",
                "disease",
                "condition",
                "blood_type",
                "patient",
                "clinic",
                "hospital",
                "medication",
                "medicine",
                "drug",
                "prescription",
                "treatment",
                "visit_date",
                "appointment_date",
                "صحي",
                "صحية",
                "صحيه",
                "طبي",
                "طبية",
                "طبيه",
                "تشخيص",
                "مرض",
                "فصيلة",
                "فصيله",
                "مريض",
                "دواء",
                "الدواء",
                "أدوية",
                "ادوية",
                "وصفة",
                "وصفه",
                "علاج",
                "تاريخ_الزيارة",
                "تاريخ الزيارة",
                "موعد"
            ],
            valueTests: []
        },

        {
            type: "بيانات مالية",
            risk: 90,
            header: [
                "salary",
                "iban",
                "bank",
                "account_number",
                "account_balance",
                "balance",
                "credit",
                "card_number",
                "income",
                "financial",
                "راتب",
                "راتب_شهري",
                "رصيد",
                "رصيد_الحساب",
                "رصيد الحساب",
                "ايبان",
                "iban",
                "بنك",
                "بنكي",
                "حساب",
                "ائتمان",
                "بطاقة",
                "بطاقه",
                "مالي",
                "مالية",
                "ماليه"
            ],
            valueTests: [
                value =>
                    /^SA\d{2}[A-Z0-9]{18,}$/i.test(
                        compact(value)
                    )
            ]
        },

        {
            type: "رقم الهوية",
            risk: 85,
            header: [
                "national_id",
                "nationalid",
                "identity",
                "identity_number",
                "id_number",
                "saudi_id",
                "رقم_الهوية",
                "رقم الهوية",
                "هوية",
                "هويه",
                "الهوية",
                "الهويه"
            ],
            valueTests: [
                value =>
                    /^[12]\d{9}$/.test(
                        digitsOnly(value)
                    )
            ]
        },

        {
            type: "بيانات الموقع الجغرافي",
            risk: 80,
            header: [
                "latitude",
                "longitude",
                "location",
                "coordinates",
                "gps",
                "lat",
                "lng",
                "lon",
                "موقع",
                "الموقع",
                "احداثيات",
                "إحداثيات",
                "خط_العرض",
                "خط_الطول"
            ],
            valueTests: []
        },

        {
            type: "بيانات التواصل",
            risk: 75,
            header: [
                "email",
                "e_mail",
                "mail",
                "phone",
                "mobile",
                "telephone",
                "contact",
                "jawal",
                "جوال",
                "الجوال",
                "هاتف",
                "الهاتف",
                "بريد",
                "البريد",
                "ايميل",
                "إيميل",
                "تواصل"
            ],
            valueTests: [
                value =>
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                        String(value || "").trim()
                    ),

                value => {
                    const digits =
                        digitsOnly(value);

                    return (
                        /^05\d{8}$/.test(digits) ||
                        /^9665\d{8}$/.test(digits)
                    );
                }
            ]
        },

        {
            type: "بيانات العملاء",
            risk: 65,
            header: [
                "customer",
                "customer_id",
                "client",
                "client_id",
                "member",
                "customer_name",
                "عميل",
                "العميل",
                "رقم_العميل",
                "رقم العميل",
                "اسم_العميل",
                "اسم العميل"
            ],
            valueTests: []
        },

        {
            type: "بيانات تعليمية",
            risk: 60,
            header: [
                "student",
                "student_id",
                "student_name",
                "major",
                "gpa",
                "academic_status",
                "academic",
                "advisor",
                "course",
                "grade",
                "اسم_الطالب",
                "اسم الطالب",
                "رقم_الطالب",
                "رقم الطالب",
                "طالب",
                "الطالب",
                "تخصص",
                "التخصص",
                "معدل",
                "المعدل",
                "حالة_أكاديمية",
                "الحالة_الأكاديمية",
                "حالة أكاديمية",
                "مرشد",
                "المرشد",
                "مقرر",
                "درجة"
            ],
            valueTests: []
        },

        {
            type: "بيانات الموظفين",
            risk: 60,
            header: [
                "name",
                "full_name",
                "first_name",
                "last_name",
                "employee",
                "employee_id",
                "employee_name",
                "job_title",
                "birth_date",
                "date_of_birth",
                "dob",
                "اسم",
                "الاسم",
                "اسم_الموظف",
                "اسم الموظف",
                "موظف",
                "الموظف",
                "رقم_الموظف",
                "رقم الموظف",
                "مسمى",
                "المسمى",
                "وظيفة",
                "وظيفه",
                "إدارة",
                "ادارة",
                "الإدارة",
                "الادارة",
                "تاريخ_الميلاد",
                "تاريخ الميلاد"
            ],
            valueTests: []
        }

    ];



    // =====================================================
    // بيانات التصنيف
    // =====================================================

    const CLASSIFICATION_LEVELS = {

        "top-secret": {
            label: "سري للغاية",
            impact: "أثر بالغ على الدولة",
            controls: [
                "قصر الوصول على الأشخاص المخولين وفق الحاجة إلى المعرفة.",
                "اشتراط موافقة إضافية قبل إتاحة البيانات.",
                "رفع مستوى التتبع والمراجعة لجميع عمليات الوصول."
            ]
        },

        "secret": {
            label: "سري",
            impact: "أثر كبير على الجهة",
            controls: [
                "تقييد الوصول وفق الحاجة الوظيفية.",
                "تقييد التنزيل والتصدير واشتراط الموافقة عند الحاجة.",
                "تسجيل عملية الوصول ومراجعتها."
            ]
        },

        "restricted": {
            label: "مقيد",
            impact: "إتاحة محدودة لفئات محددة",
            controls: [
                "التحقق من صلاحية المستخدم والغرض من الوصول.",
                "تطبيق الحد الأدنى من الصلاحيات.",
                "تسجيل عمليات الوصول."
            ]
        },

        "public": {
            label: "عام",
            impact: "متاح للنشر العام",
            controls: [
                "التحقق من اعتماد البيانات للإتاحة العامة.",
                "استمرار تطبيق متطلبات حماية البيانات الشخصية عند انطباقها."
            ]
        }

    };



    const DECISION_RANK = {
        allowed: 0,
        masked: 1,
        approval: 2,
        denied: 3
    };



    // =====================================================
    // أدوات مساعدة
    // =====================================================

    function compact(value) {

        return String(
            value || ""
        )
            .replace(/\s+/g, "")
            .trim();

    }


    function digitsOnly(value) {

        return String(
            value || ""
        )
            .replace(/\D/g, "");

    }


    function normalizeHeader(value) {

        return String(
            value || ""
        )
            .trim()
            .toLowerCase()
            .replace(/[\s\-\/]+/g, "_")
            .replace(/[()[\]{}]/g, "");

    }


    function escapeHTML(value) {

        return Core.escapeHTML(
            value
        );

    }


    function strongerDecision(
        current,
        candidate
    ) {

        return (
            DECISION_RANK[candidate] >
            DECISION_RANK[current]
        )
            ? candidate
            : current;

    }



    // =====================================================
    // محلل CSV
    // يدعم الفاصلة والفاصلة المنقوطة و Tab
    // =====================================================

    function detectDelimiter(text) {

        const firstLine =
            String(text || "")
                .split(/\r?\n/)
                .find(line => line.trim());


        if (!firstLine) {
            return ",";
        }


        const candidates =
            [",", ";", "\t"];


        let best = ",";
        let bestCount = -1;


        candidates.forEach(
            delimiter => {

                const count =
                    firstLine
                        .split(delimiter)
                        .length;


                if (count > bestCount) {

                    bestCount = count;
                    best = delimiter;

                }

            }
        );


        return best;

    }



    function parseCSV(text) {

        const delimiter =
            detectDelimiter(text);


        const rows = [];

        let row = [];
        let cell = "";
        let quoted = false;


        for (
            let i = 0;
            i < text.length;
            i += 1
        ) {

            const char =
                text[i];


            const next =
                text[i + 1];


            if (char === '"') {

                if (
                    quoted &&
                    next === '"'
                ) {

                    cell += '"';
                    i += 1;

                }
                else {

                    quoted =
                        !quoted;

                }

                continue;

            }


            if (
                char === delimiter &&
                !quoted
            ) {

                row.push(
                    cell.trim()
                );

                cell = "";

                continue;

            }


            if (
                (
                    char === "\n" ||
                    char === "\r"
                ) &&
                !quoted
            ) {

                if (
                    char === "\r" &&
                    next === "\n"
                ) {
                    i += 1;
                }


                row.push(
                    cell.trim()
                );


                if (
                    row.some(
                        value =>
                            String(value).trim()
                    )
                ) {

                    rows.push(
                        row
                    );

                }


                row = [];
                cell = "";

                continue;

            }


            cell += char;

        }


        row.push(
            cell.trim()
        );


        if (
            row.some(
                value =>
                    String(value).trim()
            )
        ) {

            rows.push(
                row
            );

        }


        if (
            rows.length <
            2
        ) {

            throw new Error(
                "الملف لا يحتوي على صف عناوين وسجلات بيانات كافية."
            );

        }


        const headers =
            rows[0]
                .map(
                    (header, index) =>
                        header ||
                        `column_${index + 1}`
                );


        const dataRows =
            rows
                .slice(1)
                .filter(
                    values =>
                        values.some(
                            value =>
                                String(value).trim()
                        )
                )
                .map(
                    values => {

                        const item = {};


                        headers.forEach(
                            (header, index) => {

                                item[header] =
                                    values[index] ??
                                    "";

                            }
                        );


                        return item;

                    }
                );


        return {
            headers,
            rows: dataRows,
            delimiter
        };

    }



    // =====================================================
    // اكتشاف البيانات الشخصية
    // =====================================================

    function matchHeader(
        header,
        rule
    ) {

        const normalized =
            normalizeHeader(
                header
            );


        return rule.header.some(
            keyword => {

                const normalizedKeyword =
                    normalizeHeader(
                        keyword
                    );


                return (
                    normalized ===
                    normalizedKeyword
                ) ||
                normalized.includes(
                    normalizedKeyword
                );

            }
        );

    }



    function matchValues(
        values,
        rule
    ) {

        if (
            !rule.valueTests.length
        ) {
            return 0;
        }


        const sample =
            values
                .filter(
                    value =>
                        String(value).trim()
                )
                .slice(0, 30);


        if (!sample.length) {
            return 0;
        }


        let matches = 0;


        sample.forEach(
            value => {

                if (
                    rule.valueTests.some(
                        test => {

                            try {
                                return test(value);
                            }
                            catch (error) {
                                return false;
                            }

                        }
                    )
                ) {

                    matches += 1;

                }

            }
        );


        return (
            matches /
            sample.length
        );

    }



    function detectColumn(
        header,
        values
    ) {

        let best = null;


        DETECTION_RULES.forEach(
            rule => {

                const headerMatched =
                    matchHeader(
                        header,
                        rule
                    );


                const valueRatio =
                    matchValues(
                        values,
                        rule
                    );


                let confidence = 0;
                let reason = "";


                if (headerMatched) {

                    confidence = 0.96;
                    reason = "اسم العمود";

                }


                if (
                    valueRatio >=
                    0.6
                ) {

                    const valueConfidence =
                        Math.min(
                            0.92,
                            0.72 +
                            valueRatio * 0.2
                        );


                    if (
                        valueConfidence >
                        confidence
                    ) {

                        confidence =
                            valueConfidence;

                        reason =
                            "نمط القيم";

                    }

                }


                if (
                    headerMatched &&
                    valueRatio >=
                    0.4
                ) {

                    confidence = 0.99;
                    reason =
                        "اسم العمود ونمط القيم";

                }


                if (
                    confidence > 0 &&
                    (
                        !best ||
                        confidence >
                        best.confidence
                    )
                ) {

                    best = {
                        header,
                        type:
                            rule.type,
                        confidence,
                        reason
                    };

                }

            }
        );


        return best;

    }




    // =====================================================
    // مجال الملف
    // المجال يحدد "من يحق له الوصول"،
    // أما أنواع البيانات الشخصية داخله فتحدد أسلوب الحماية والإخفاء.
    // =====================================================

    const FILE_DOMAIN_RULES = {

        health: {
            label: "البيانات الصحية",
            systems: ["Health_System"],
            departments: ["الصحة المهنية"],
            signals: [
                "patient",
                "diagnosis",
                "medical",
                "health",
                "clinic",
                "hospital",
                "medication",
                "blood_type",
                "مريض",
                "مرضى",
                "تشخيص",
                "صحي",
                "صحية",
                "طبي",
                "عيادة",
                "مستشفى",
                "دواء",
                "فصيلة"
            ],
            actions: {
                VIEW: "masked",
                UPDATE: "allowed",
                DOWNLOAD: "approval",
                EXPORT: "approval",
                DELETE: "approval"
            },
            maxRecords: {
                VIEW: 80,
                UPDATE: 30,
                DOWNLOAD: 20,
                EXPORT: 20,
                DELETE: 10
            }
        },

        employees: {
            label: "بيانات الموظفين",
            systems: ["HR_System", "Payroll_System"],
            departments: ["الموارد البشرية"],
            signals: [
                "employee",
                "employee_id",
                "employee_name",
                "job_title",
                "employment",
                "موظف",
                "الموظف",
                "الموظفين",
                "رقم_الموظف",
                "اسم_الموظف",
                "مسمى",
                "وظيفي"
            ],
            actions: {
                VIEW: "allowed",
                UPDATE: "allowed",
                DOWNLOAD: "approval",
                EXPORT: "approval",
                DELETE: "approval"
            },
            maxRecords: {
                VIEW: 150,
                UPDATE: 50,
                DOWNLOAD: 40,
                EXPORT: 40,
                DELETE: 10
            }
        },

        finance: {
            label: "البيانات المالية",
            systems: ["Finance_System", "Payroll_System"],
            departments: ["المالية"],
            signals: [
                "iban",
                "bank",
                "account_balance",
                "account_number",
                "financial",
                "credit",
                "income",
                "بنك",
                "بنكي",
                "ايبان",
                "آيبان",
                "حساب",
                "رصيد",
                "مالي",
                "مالية",
                "ائتمان"
            ],
            actions: {
                VIEW: "masked",
                UPDATE: "allowed",
                DOWNLOAD: "approval",
                EXPORT: "approval",
                DELETE: "approval"
            },
            maxRecords: {
                VIEW: 150,
                UPDATE: 50,
                DOWNLOAD: 30,
                EXPORT: 50,
                DELETE: 10
            }
        },

        customers: {
            label: "بيانات العملاء",
            systems: ["CRM_System"],
            departments: ["خدمة العملاء", "التسويق"],
            signals: [
                "customer",
                "client",
                "customer_id",
                "customer_name",
                "client_id",
                "عميل",
                "العميل",
                "العملاء",
                "رقم_العميل",
                "اسم_العميل"
            ],
            actions: {
                VIEW: "masked",
                UPDATE: "allowed",
                DOWNLOAD: "approval",
                EXPORT: "approval",
                DELETE: "approval"
            },
            maxRecords: {
                VIEW: 250,
                UPDATE: 80,
                DOWNLOAD: 50,
                EXPORT: 100,
                DELETE: 10
            }
        },

        education: {
            label: "البيانات التعليمية",
            systems: ["Student_System"],
            departments: ["الشؤون التعليمية"],
            signals: [
                "student",
                "student_id",
                "student_name",
                "major",
                "gpa",
                "academic",
                "advisor",
                "course",
                "طالب",
                "الطالب",
                "الطلاب",
                "رقم_الطالب",
                "اسم_الطالب",
                "تخصص",
                "معدل",
                "أكاديمي",
                "اكاديمي"
            ],
            actions: {
                VIEW: "allowed",
                UPDATE: "allowed",
                DOWNLOAD: "approval",
                EXPORT: "approval",
                DELETE: "approval"
            },
            maxRecords: {
                VIEW: 200,
                UPDATE: 80,
                DOWNLOAD: 50,
                EXPORT: 50,
                DELETE: 10
            }
        }

    };


    function detectFileDomain(
        fileName,
        headers
    ) {

        const searchable =
            [
                String(fileName || ""),
                ...headers
            ]
                .map(
                    item =>
                        normalizeHeader(item)
                )
                .join(" ");


        const scored =
            Object.entries(
                FILE_DOMAIN_RULES
            )
                .map(
                    ([key, rule]) => {

                        let score = 0;


                        rule.signals.forEach(
                            signal => {

                                const normalizedSignal =
                                    normalizeHeader(
                                        signal
                                    );


                                if (
                                    searchable.includes(
                                        normalizedSignal
                                    )
                                ) {

                                    score += 1;

                                }

                            }
                        );


                        return {
                            key,
                            label:
                                rule.label,
                            score
                        };

                    }
                )
                .sort(
                    (a, b) =>
                        b.score -
                        a.score
                );


        if (
            !scored.length ||
            scored[0].score === 0
        ) {

            return {
                key: "unknown",
                label: "مجال غير محدد",
                score: 0
            };

        }


        return scored[0];

    }


    function analyzeParsedFile(
        file,
        parsed
    ) {

        const detectedFields = [];


        parsed.headers.forEach(
            header => {

                const values =
                    parsed.rows.map(
                        row =>
                            row[header]
                    );


                const detection =
                    detectColumn(
                        header,
                        values
                    );


                if (detection) {

                    detectedFields.push(
                        detection
                    );

                }

            }
        );


        const detectedTypes =
            Array.from(
                new Set(
                    detectedFields.map(
                        item =>
                            item.type
                    )
                )
            );


        const domain =
            detectFileDomain(
                file.name,
                parsed.headers
            );


        return {
            fileName:
                file.name,

            fileSize:
                file.size,

            headers:
                parsed.headers,

            rows:
                parsed.rows,

            rowCount:
                parsed.rows.length,

            columnCount:
                parsed.headers.length,

            detectedFields,

            detectedTypes,

            domain
        };

    }



    // =====================================================
    // إخفاء القيم الحقيقية في المعاينة
    // =====================================================

    function detectionForHeader(
        header
    ) {

        if (!uploadedAnalysis) {
            return null;
        }


        return (
            uploadedAnalysis.detectedFields
                .find(
                    item =>
                        item.header ===
                        header
                ) ||
            null
        );

    }



    function maskValue(
        value,
        detection
    ) {

        const text =
            String(
                value ?? ""
            ).trim();


        // إذا لم يُكتشف العمود كبيانات شخصية
        if (!detection) {

            if (
                text.length >
                22
            ) {

                return (
                    text.slice(0, 19) +
                    "..."
                );

            }

            return text;

        }


        // ==========================================
        // أعمدة الأسماء
        // حتى لو كان الاسم داخل ملف صحي مثل patient_name
        // يظهر أول حرف فقط ثم نقاط.
        // ==========================================

        const normalizedDetectedHeader =
            normalizeHeader(
                detection.header || ""
            );


        const isNameField =
            [
                "name",
                "full_name",
                "first_name",
                "last_name",
                "patient_name",
                "employee_name",
                "customer_name",
                "student_name",
                "اسم",
                "الاسم",
                "اسم_المريض",
                "اسم_الموظف",
                "اسم_العميل",
                "اسم_الطالب"
            ].some(
                keyword =>
                    normalizedDetectedHeader.includes(
                        normalizeHeader(keyword)
                    )
            );


        if (isNameField) {

            if (!text) {
                return "••••";
            }


            return (
                text.slice(0, 1) +
                "••••"
            );

        }


        // ==========================================
        // البيانات التعليمية
        // مثل التخصص والمعدل والحالة الأكاديمية
        // تُخفى في المعاينة لأنها مرتبطة بالطالب.
        // اسم الطالب يعالج أعلاه بإظهار أول حرف فقط.
        // ==========================================

        if (
            detection.type ===
            "بيانات تعليمية"
        ) {

            return "••••••";

        }


        // ==========================================
        // الاسم / بيانات الموظف / العميل
        // إظهار أول حرف فقط
        // ==========================================

        if (
            detection.type ===
            "بيانات الموظفين" ||
            detection.type ===
            "بيانات العملاء"
        ) {

            if (!text) {
                return "••••";
            }

            return (
                text.slice(0, 1) +
                "••••"
            );

        }


        // ==========================================
        // رقم الهوية
        // إظهار أول رقمين وآخر رقمين فقط
        // ==========================================

        if (
            detection.type ===
            "رقم الهوية"
        ) {

            const digits =
                digitsOnly(
                    text
                );


            if (
                digits.length >=
                6
            ) {

                return (
                    digits.slice(0, 2) +
                    "••••••" +
                    digits.slice(-2)
                );

            }

            return "••••••••";

        }


        // ==========================================
        // بيانات التواصل
        // البريد: أول حرف + النطاق
        // الجوال: أول رقمين + آخر رقمين
        // ==========================================

        if (
            detection.type ===
            "بيانات التواصل"
        ) {

            if (
                text.includes("@")
            ) {

                const parts =
                    text.split("@");

                const local =
                    parts[0] || "";

                const domain =
                    parts[1] || "example.com";


                return (
                    (
                        local.slice(0, 1) ||
                        "*"
                    ) +
                    "***@" +
                    domain
                );

            }


            const digits =
                digitsOnly(
                    text
                );


            if (
                digits.length >=
                8
            ) {

                return (
                    digits.slice(0, 2) +
                    "••••••" +
                    digits.slice(-2)
                );

            }

            return "••••••••";

        }


        // ==========================================
        // البيانات المالية
        // إظهار آخر 4 خانات فقط عند الحاجة
        // ==========================================

        if (
            detection.type ===
            "بيانات مالية"
        ) {

            const financialHeader =
                normalizeHeader(
                    detection.header || ""
                );


            const isFinancialAmount =
                [
                    "salary",
                    "income",
                    "monthly_income",
                    "account_balance",
                    "balance",
                    "راتب",
                    "دخل",
                    "رصيد",
                    "رصيد_الحساب"
                ].some(
                    keyword =>
                        financialHeader.includes(
                            normalizeHeader(keyword)
                        )
                );


            // القيم المالية مثل الراتب والدخل والرصيد:
            // لا يظهر منها أي رقم في المعاينة.
            if (isFinancialAmount) {

                return "•••••• ريال";

            }


            // المعرفات المالية مثل رقم الحساب أو الآيبان:
            // نظهر آخر 4 خانات فقط عند الحاجة.
            const compactText =
                compact(
                    text
                );


            if (
                compactText.length >=
                6
            ) {

                return (
                    "••••••" +
                    compactText.slice(-4)
                );

            }


            return "••••";

        }


        // ==========================================
        // البيانات الصحية والبيومترية والموقع
        // لا نعرض القيمة نفسها؛ تظهر كنقاط فقط
        // بدل عبارة "محجوب لحماية الخصوصية".
        // ==========================================

        if (
            detection.type ===
            "بيانات صحية" ||
            detection.type ===
            "بيانات حيوية أو بيومترية" ||
            detection.type ===
            "بيانات الموقع الجغرافي"
        ) {

            return "••••••••";

        }


        return "••••";

    }



    // =====================================================
    // عرض نتيجة تحليل الملف
    // =====================================================

    function confidenceLabel(
        confidence
    ) {

        if (
            confidence >=
            0.95
        ) {
            return "ثقة مرتفعة";
        }


        if (
            confidence >=
            0.8
        ) {
            return "ثقة جيدة";
        }


        return "ثقة مبدئية";

    }



    function renderDetectedFields() {

        const list =
            document.getElementById(
                "detected-fields-list"
            );


        if (!list) {
            return;
        }


        if (
            !uploadedAnalysis ||
            !uploadedAnalysis.detectedFields.length
        ) {

            list.innerHTML = `
                <div class="no-detected-fields">
                    لم يكتشف أثر حقولًا شخصية واضحة من أسماء الأعمدة أو أنماط القيم.
                </div>
            `;

            return;

        }


        list.innerHTML =
            uploadedAnalysis.detectedFields
                .map(
                    field => `

                        <article class="detected-field-card">

                            <div class="detected-field-name">

                                <span>
                                    اسم العمود
                                </span>

                                <strong>
                                    ${escapeHTML(field.header)}
                                </strong>

                            </div>


                            <div class="detected-field-type">

                                <span>
                                    النوع المكتشف
                                </span>

                                <strong>
                                    ${escapeHTML(field.type)}
                                </strong>

                            </div>


                            <div class="detected-field-confidence">

                                <span>
                                    ${escapeHTML(confidenceLabel(field.confidence))}
                                </span>

                                <small>
                                    اعتمادًا على ${escapeHTML(field.reason)}
                                </small>

                            </div>

                        </article>

                    `
                )
                .join("");

    }



    function renderUploadedPreview() {

        const table =
            document.getElementById(
                "uploaded-preview-table"
            );


        if (
            !table ||
            !uploadedAnalysis
        ) {
            return;
        }


        const headers =
            uploadedAnalysis.headers
                .slice(0, 8);


        const rows =
            uploadedAnalysis.rows
                .slice(0, 5);


        table.innerHTML = `

            <thead>
                <tr>
                    ${headers
                        .map(
                            header =>
                                `<th>${escapeHTML(header)}</th>`
                        )
                        .join("")
                    }
                </tr>
            </thead>

            <tbody>

                ${rows
                    .map(
                        row => `

                            <tr>

                                ${headers
                                    .map(
                                        header => {

                                            const detection =
                                                detectionForHeader(
                                                    header
                                                );


                                            const value =
                                                maskValue(
                                                    row[header],
                                                    detection
                                                );


                                            return `
                                                <td
                                                    class="${detection ? "detected-cell" : ""}"
                                                >
                                                    ${escapeHTML(value)}
                                                </td>
                                            `;

                                        }
                                    )
                                    .join("")
                                }

                            </tr>

                        `
                    )
                    .join("")
                }

            </tbody>

        `;

    }



    function renderAnalysis() {

        if (!uploadedAnalysis) {
            return;
        }


        document.getElementById(
            "analysis-file-name"
        ).textContent =
            uploadedAnalysis.fileName;


        document.getElementById(
            "analysis-row-count"
        ).textContent =
            uploadedAnalysis.rowCount;


        document.getElementById(
            "analysis-column-count"
        ).textContent =
            uploadedAnalysis.columnCount;


        document.getElementById(
            "analysis-personal-count"
        ).textContent =
            uploadedAnalysis.detectedFields.length;


        const status =
            document.getElementById(
                "personal-data-detection-status"
            );


        const detectedTypesBadge =
            document.getElementById(
                "detected-types-badge"
            );


        if (
            uploadedAnalysis.detectedFields.length
        ) {

            status.className =
                "personal-data-detection-status detected";


            status.innerHTML = `
                <strong>
                    تم اكتشاف بيانات شخصية محتملة في الملف
                </strong>

                <p>
                    وجد أثر
                    ${uploadedAnalysis.detectedFields.length}
                    حقول يُحتمل أن تحتوي على بيانات شخصية ضمن
                    ${uploadedAnalysis.detectedTypes.length}
                    فئات بيانات.
                </p>
            `;


            detectedTypesBadge.textContent =
                "المجال: " +
                uploadedAnalysis.domain.label;


            detectedTypesBadge.className =
                "protection-badge protection-tone-info";


            continueButton.disabled =
                false;

        }
        else {

            status.className =
                "personal-data-detection-status not-detected";


            status.innerHTML = `
                <strong>
                    لم يتم اكتشاف بيانات شخصية واضحة
                </strong>

                <p>
                    جرّب ملفًا يحتوي على أعمدة مثل الاسم،
                    رقم الهوية، البريد الإلكتروني، الجوال،
                    البيانات المالية أو الصحية.
                </p>
            `;


            detectedTypesBadge.textContent =
                "لا توجد أنواع مكتشفة";


            detectedTypesBadge.className =
                "protection-badge protection-tone-info";


            continueButton.disabled =
                true;

        }


        renderDetectedFields();
        renderUploadedPreview();


        analysisResult.hidden =
            false;

    }



    // =====================================================
    // قراءة الملف الحقيقي
    // =====================================================

    function readUploadedFile(
        file
    ) {

        if (!file) {
            return;
        }


        const extension =
            String(
                file.name || ""
            )
                .toLowerCase();


        if (
            !extension.endsWith(
                ".csv"
            )
        ) {

            analysisValidation.textContent =
                "يرجى اختيار ملف بصيغة CSV.";

            return;

        }


        analysisValidation.textContent =
            "";


        analysisResult.hidden =
            true;


        loadingBox.hidden =
            false;


        const reader =
            new FileReader();


        reader.onload =
            function () {

                try {

                    const text =
                        String(
                            reader.result || ""
                        )
                            .replace(
                                /^\uFEFF/,
                                ""
                            );


                    const parsed =
                        parseCSV(
                            text
                        );


                    uploadedAnalysis =
                        analyzeParsedFile(
                            file,
                            parsed
                        );


                    renderAnalysis();

                }
                catch (error) {

                    uploadedAnalysis =
                        null;


                    analysisValidation.textContent =
                        error.message ||
                        "تعذر قراءة ملف CSV.";

                }
                finally {

                    loadingBox.hidden =
                        true;

                }

            };


        reader.onerror =
            function () {

                loadingBox.hidden =
                    true;


                analysisValidation.textContent =
                    "تعذر قراءة الملف من الجهاز.";

            };


        reader.readAsText(
            file,
            "UTF-8"
        );

    }



    // =====================================================
    // اختيار وسحب الملف
    // =====================================================

    function openFilePicker() {

        if (fileInput) {

            fileInput.value = "";
            fileInput.click();

        }

    }


    chooseFileButton.addEventListener(
        "click",
        openFilePicker
    );


    replaceFileButton.addEventListener(
        "click",
        openFilePicker
    );


    fileInput.addEventListener(
        "change",
        function () {

            const file =
                fileInput.files[0];


            if (file) {

                readUploadedFile(
                    file
                );

            }

        }
    );


    [
        "dragenter",
        "dragover"
    ].forEach(
        eventName => {

            dropzone.addEventListener(
                eventName,
                function (event) {

                    event.preventDefault();

                    dropzone.classList.add(
                        "drag-active"
                    );

                }
            );

        }
    );


    [
        "dragleave",
        "drop"
    ].forEach(
        eventName => {

            dropzone.addEventListener(
                eventName,
                function (event) {

                    event.preventDefault();

                    dropzone.classList.remove(
                        "drag-active"
                    );

                }
            );

        }
    );


    dropzone.addEventListener(
        "drop",
        function (event) {

            const file =
                event.dataTransfer
                    ?.files
                    ?.[0];


            if (file) {

                readUploadedFile(
                    file
                );

            }

        }
    );



    // =====================================================
    // الخريطة والانتقال داخل نفس الصفحة
    // =====================================================

    function updateProtectionSteps(
        stepNumber
    ) {

        const steps =
            document.querySelectorAll(
                ".protection-step"
            );


        const lines =
            document.querySelectorAll(
                ".step-line"
            );


        steps.forEach(
            step => {

                const number =
                    Number(
                        step.dataset.step
                    );


                step.classList.remove(
                    "active",
                    "completed"
                );


                step.removeAttribute(
                    "aria-current"
                );


                if (
                    number <
                    stepNumber
                ) {

                    step.classList.add(
                        "completed"
                    );

                }


                if (
                    number ===
                    stepNumber
                ) {

                    step.classList.add(
                        "active"
                    );


                    step.setAttribute(
                        "aria-current",
                        "step"
                    );

                }

            }
        );


        lines.forEach(
            (line, index) => {

                line.classList.toggle(
                    "completed",
                    index <
                    stepNumber - 1
                );

            }
        );

    }



    function showStep(
        stepNumber
    ) {

        currentStep =
            stepNumber;


        document
            .querySelectorAll(
                ".protection-step-panel"
            )
            .forEach(
                panel => {

                    panel.hidden =
                        Number(
                            panel.dataset.panel
                        ) !==
                        stepNumber;

                }
            );


        updateProtectionSteps(
            stepNumber
        );


        document.getElementById(
            "protection-steps"
        )
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

    }



    // =====================================================
    // الانتقال إلى الخطوة الثانية
    // =====================================================

    function prepareAccessStep() {

        if (
            !uploadedAnalysis ||
            !uploadedAnalysis.detectedFields.length
        ) {

            analysisValidation.textContent =
                "يجب رفع ملف واكتشاف بيانات شخصية محتملة قبل المتابعة.";

            return;

        }


        document.getElementById(
            "selected-file-name"
        ).textContent =
            uploadedAnalysis.fileName;


        document.getElementById(
            "selected-row-count"
        ).textContent =
            uploadedAnalysis.rowCount;


        document.getElementById(
            "selected-file-domain"
        ).textContent =
            uploadedAnalysis.domain.label;


        document.getElementById(
            "access-file-domain"
        ).textContent =
            uploadedAnalysis.domain.label;


        document.getElementById(
            "access-detected-fields"
        ).textContent =
            "البيانات الشخصية المكتشفة داخله: " +
            uploadedAnalysis.detectedTypes
                .join("، ");


        document.getElementById(
            "record-count"
        ).value =
            uploadedAnalysis.rowCount;


        showStep(2);

    }


    continueButton.addEventListener(
        "click",
        prepareAccessStep
    );


    document.getElementById(
        "change-file"
    )
        .addEventListener(
            "click",
            function () {

                showStep(1);

            }
        );


    document.getElementById(
        "back-to-file"
    )
        .addEventListener(
            "click",
            function () {

                showStep(1);

            }
        );



    // =====================================================
    // اختيار مستوى التصنيف
    // =====================================================

    function getSelectedClassification() {

        const checked =
            document.querySelector(
                'input[name="dataClassification"]:checked'
            );


        return checked
            ? checked.value
            : "";

    }



    function updateClassificationChoice() {

        selectedClassification =
            getSelectedClassification();


        classificationInputs.forEach(
            input => {

                const card =
                    input.closest(
                        ".classification-choice"
                    );


                card?.classList.toggle(
                    "selected",
                    input.checked
                );

            }
        );


        if (
            selectedClassification
        ) {

            classificationValidation.textContent =
                "";

        }

    }


    classificationInputs.forEach(
        input => {

            input.addEventListener(
                "change",
                updateClassificationChoice
            );

        }
    );



    // =====================================================
    // تطبيق التصنيف المختار على القرار
    // =====================================================

    function applyClassificationToResult(
        result
    ) {

        const meta =
            CLASSIFICATION_LEVELS[
                selectedClassification
            ];


        if (!meta) {
            return result;
        }


        let decision =
            result.decision;


        if (
            selectedClassification ===
            "top-secret"
        ) {

            decision =
                strongerDecision(
                    decision,
                    "approval"
                );


            result.reasons.push(
                "مستوى التصنيف سري للغاية يستلزم موافقة إضافية قبل إتاحة الملف."
            );

        }


        if (
            selectedClassification ===
            "secret"
        ) {

            if (
                [
                    "DOWNLOAD",
                    "EXPORT",
                    "DELETE"
                ].includes(
                    result.request.action
                )
            ) {

                decision =
                    strongerDecision(
                        decision,
                        "approval"
                    );

            }
            else {

                decision =
                    strongerDecision(
                        decision,
                        "masked"
                    );

            }


            result.reasons.push(
                "مستوى التصنيف سري يرفع متطلبات التحكم في الوصول إلى الملف."
            );

        }


        if (
            selectedClassification ===
            "restricted"
        ) {

            result.reasons.push(
                "مستوى التصنيف مقيد يعني أن الإتاحة محصورة بالمستخدمين والأغراض المصرح بها."
            );

        }


        if (
            selectedClassification ===
            "public"
        ) {

            result.reasons.push(
                "التصنيف عام لا يلغي متطلبات حماية البيانات الشخصية التي اكتشفها النظام داخل الملف."
            );

        }


        result.decision =
            decision;


        result.decisionMeta =
            Core.DECISIONS[
                decision
            ];


        result.classification = {
            level:
                selectedClassification,

            label:
                meta.label,

            impact:
                meta.impact,

            source:
                "التصنيف المعتمد الذي حدده المستخدم"
        };


        meta.controls.forEach(
            control => {

                if (
                    !result.controls.includes(
                        control
                    )
                ) {

                    result.controls.push(
                        control
                    );

                }

            }
        );


        return result;

    }



    // =====================================================
    // معاينة من الملف الحقيقي
    // =====================================================

    function buildRealFilePreview(
        result
    ) {

        if (!uploadedAnalysis) {
            return "";
        }


        const detectedHeaders =
            uploadedAnalysis.detectedFields
                .map(
                    item =>
                        item.header
                )
                .slice(0, 5);


        const row =
            uploadedAnalysis.rows[0] ||
            {};


        if (!detectedHeaders.length) {
            return "";
        }


        return detectedHeaders
            .map(
                header => {

                    const detection =
                        detectionForHeader(
                            header
                        );


                    const typeEvaluation =
                        result.typeEvaluations
                            ?.find(
                                item =>
                                    item.dataType ===
                                    detection?.type
                            );


                    let protectedValue =
                        maskValue(
                            row[header],
                            detection
                        );


                    if (
                        typeEvaluation
                            ?.decision ===
                        "denied"
                    ) {

                        protectedValue =
                            "محجوب لعدم وجود صلاحية";

                    }


                    if (
                        typeEvaluation
                            ?.decision ===
                        "approval"
                    ) {

                        protectedValue =
                            "غير متاح قبل الموافقة";

                    }


                    return `

                        <div>

                            <span>
                                ${escapeHTML(header)}
                            </span>

                            <b>
                                ${escapeHTML(protectedValue)}
                            </b>

                        </div>

                    `;

                }
            )
            .join("");

    }



    // =====================================================
    // تلخيص إجراءات حماية البيانات الشخصية المطبقة
    // =====================================================

    function getAppliedProtectionActions(
        result
    ) {

        const actions = [];

        const detectedCount =
            uploadedAnalysis
                ?.detectedFields
                ?.length || 0;


        actions.push({
            title:
                "اكتشاف البيانات الشخصية",

            status:
                detectedCount > 0
                    ? "مطبق"
                    : "غير مكتشف",

            detail:
                detectedCount > 0
                    ? `تم اكتشاف ${detectedCount} حقول شخصية محتملة في الملف.`
                    : "لم تُكتشف حقول شخصية واضحة."
        });


        actions.push({
            title:
                "إخفاء القيم الشخصية",

            status:
                "مطبق",

            detail:
                "تُعرض القيم الشخصية في المعاينة بصورة مخفية أو منخفضة الدقة."
        });


        let accessDetail =
            "تم تقييم الطلب وفق الصلاحية والغرض ونوع العملية.";


        if (
            result.decision ===
            "masked"
        ) {

            accessDetail =
                "تم السماح بالوصول مع إخفاء البيانات الشخصية غير اللازمة.";

        }


        if (
            result.decision ===
            "approval"
        ) {

            accessDetail =
                "تم إيقاف إتاحة البيانات الشخصية إلى حين اعتماد الطلب.";

        }


        if (
            result.decision ===
            "denied"
        ) {

            accessDetail =
                "تم حجب الوصول إلى البيانات الشخصية ومنع عرض محتوى الملف.";

        }


        actions.push({
            title:
                "التحكم في الوصول",

            status:
                result.decisionMeta.label,

            detail:
                accessDetail
        });


        const requestedAction =
            result.request.action;


        if (
            [
                "DOWNLOAD",
                "EXPORT"
            ].includes(
                requestedAction
            )
        ) {

            const extractionBlocked =
                [
                    "approval",
                    "denied"
                ].includes(
                    result.decision
                );


            actions.push({
                title:
                    "حماية من إخراج البيانات",

                status:
                    extractionBlocked
                        ? "مقيد"
                        : "وفق الصلاحية",

                detail:
                    extractionBlocked
                        ? "لم يُسمح بإخراج نسخة من البيانات الشخصية قبل استيفاء متطلبات الحماية."
                        : "سمح القرار بالعملية ضمن الصلاحية المحددة."
            });

        }


        actions.push({
            title:
                "تسجيل قرار الحماية",

            status:
                "تم",

            detail:
                "تم حفظ قرار الوصول وأسبابه محليًا في سجل الحماية للمراجعة."
        });


        return actions;

    }


    function renderAppliedProtectionActions(
        result
    ) {

        return getAppliedProtectionActions(
            result
        )
            .map(
                item => `

                    <div class="applied-protection-item">

                        <div>

                            <span>
                                ${escapeHTML(item.title)}
                            </span>

                            <strong>
                                ${escapeHTML(item.status)}
                            </strong>

                        </div>

                        <p>
                            ${escapeHTML(item.detail)}
                        </p>

                    </div>

                `
            )
            .join("");

    }


    // =====================================================
    // عرض قرار الحماية
    // =====================================================

    function decisionToneClass(
        decision
    ) {

        return (
            "protection-tone-" +
            (
                Core.DECISIONS[
                    decision
                ]?.tone ||
                "neutral"
            )
        );

    }



    function renderDecision(
        result
    ) {

        const mayShowPreview =
            [
                "allowed",
                "masked"
            ].includes(
                result.decision
            );


        emptyState.hidden =
            true;


        resultBox.hidden =
            false;


        const realPreview =
            buildRealFilePreview(
                result
            );


        resultBox.innerHTML = `

            <article
                class="protection-decision-card ${decisionToneClass(result.decision)}"
            >

                <div class="protection-decision-head">

                    <div class="protection-decision-icon">
                        ${escapeHTML(result.decisionMeta.icon)}
                    </div>


                    <div>

                        <span>
                            قرار الحماية
                        </span>

                        <h2>
                            ${escapeHTML(result.decisionMeta.label)}
                        </h2>

                        <p>
                            الملف:
                            ${escapeHTML(uploadedAnalysis.fileName)}
                            —
                            ${uploadedAnalysis.rowCount}
                            سجل
                        </p>

                    </div>

                </div>



                <div class="real-file-result-summary">

                    <div>
                        <span>البيانات المكتشفة</span>
                        <strong>
                            ${escapeHTML(
                                uploadedAnalysis.detectedTypes.join("، ")
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>مجال الملف</span>
                        <strong>
                            ${escapeHTML(
                                uploadedAnalysis.domain.label
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>التصنيف المعتمد</span>
                        <strong>
                            ${escapeHTML(result.classification.label)}
                        </strong>
                    </div>

                </div>



                <section class="applied-protection-section">

                    <div class="applied-protection-heading">

                        <span class="section-label">
                            حماية البيانات الشخصية المطبقة
                        </span>

                        <h3>
                            ماذا فعل أثر لحماية الملف؟
                        </h3>

                    </div>

                    <div class="applied-protection-grid">

                        ${renderAppliedProtectionActions(result)}

                    </div>

                </section>



                <div class="protection-decision-grid">

                    <div>

                        <strong>
                            أسباب القرار
                        </strong>

                        <ul>

                            ${result.reasons
                                .map(
                                    reason =>
                                        `<li>${escapeHTML(reason)}</li>`
                                )
                                .join("")
                            }

                        </ul>

                    </div>


                    <div>

                        <strong>
                            إجراءات الحماية
                        </strong>

                        <ul>

                            ${result.controls
                                .map(
                                    control =>
                                        `<li>${escapeHTML(control)}</li>`
                                )
                                .join("")
                            }

                        </ul>

                    </div>

                </div>



                <div class="protected-data-preview">

                    <strong>
                        ${
                            mayShowPreview
                                ? "معاينة من الملف الحقيقي بعد إخفاء البيانات"
                                : "حالة محتوى الملف"
                        }
                    </strong>


                    ${
                        mayShowPreview

                            ? (
                                realPreview ||
                                `
                                    <div>
                                        <span>البيانات</span>
                                        <b>تم تطبيق الإخفاء</b>
                                    </div>
                                `
                            )

                            : `

                                <div>

                                    <span>
                                        الملف
                                    </span>

                                    <b>
                                        ${
                                            result.decision ===
                                            "approval"

                                                ? "غير متاح قبل الموافقة"

                                                : "تم حجب الوصول إلى الملف"
                                        }
                                    </b>

                                </div>

                            `
                    }

                </div>

            </article>

        `;

    }



    // =====================================================
    // فحص جميع أنواع البيانات الشخصية المكتشفة
    // لا يوجد ترتيب ثابت بأن نوعًا "أعلى" من الآخر
    // =====================================================

    function evaluateAllDetectedTypes(
        request
    ) {

        const domain =
            uploadedAnalysis.domain;


        const policy =
            FILE_DOMAIN_RULES[
                domain.key
            ];


        const types =
            uploadedAnalysis.detectedTypes;


        const reasons = [];
        const controls = [];

        let decision =
            "allowed";


        // ---------------------------------------------
        // 1) يجب أن يكون مجال الملف معروفًا
        // ---------------------------------------------

        if (!policy) {

            decision =
                "approval";


            reasons.push(
                "تعذر تحديد مجال الملف بدقة؛ لذلك يلزم مراجعته من مسؤول مخول قبل إتاحة البيانات الشخصية."
            );


            controls.push(
                "إيقاف الإتاحة إلى حين تحديد مجال الملف وصاحب الصلاحية."
            );

        }


        // ---------------------------------------------
        // 2) الخصوصية والالتزام:
        // مراجعة فقط، ولا تحصل على وصول مباشر للمحتوى
        // ---------------------------------------------

        else if (
            request.department ===
            "الخصوصية والالتزام"
        ) {

            if (
                request.action ===
                "VIEW"
            ) {

                decision =
                    "approval";


                reasons.push(
                    `الملف ضمن مجال ${policy.label}. إدارة الخصوصية والالتزام تستطيع طلب المراجعة، لكن الوصول إلى المحتوى يتطلب اعتمادًا من صاحب الصلاحية في المجال.`
                );


                controls.push(
                    "عدم إتاحة المحتوى قبل اعتماد صاحب الصلاحية في مجال البيانات."
                );

            }
            else {

                decision =
                    "denied";


                reasons.push(
                    "إدارة الخصوصية والالتزام ليست الجهة التشغيلية المخولة بتنفيذ هذه العملية على الملف."
                );

            }

        }


        // ---------------------------------------------
        // 3) الإدارة يجب أن تكون من نفس مجال الملف
        // ---------------------------------------------

        else if (
            !policy.departments.includes(
                request.department
            )
        ) {

            decision =
                "denied";


            reasons.push(
                `مجال الملف هو ${policy.label}، بينما الإدارة الطالبة هي ${request.department}. لا يوجد ارتباط وظيفي مباشر يسمح لها بالوصول إلى هذا المجال.`
            );


            controls.push(
                "حجب الوصول لأن الإدارة الطالبة ليست ضمن الجهات المخولة لهذا المجال."
            );

        }


        // ---------------------------------------------
        // 4) النظام يجب أن يكون مخصصًا لنفس المجال
        // ---------------------------------------------

        else if (
            !policy.systems.includes(
                request.system
            )
        ) {

            decision =
                "denied";


            reasons.push(
                `الإدارة مخولة بمجال ${policy.label}، لكن النظام المختار ليس من الأنظمة المعتمدة للوصول إلى هذا المجال.`
            );


            controls.push(
                "منع الوصول من نظام غير مخصص لمجال البيانات."
            );

        }


        // ---------------------------------------------
        // 5) الغرض الوظيفي إلزامي
        // ---------------------------------------------

        else if (
            !String(
                request.purpose || ""
            ).trim()
        ) {

            decision =
                "denied";


            reasons.push(
                "لم يُحدد غرض وظيفي واضح للوصول إلى البيانات الشخصية."
            );


            controls.push(
                "عدم إتاحة البيانات دون غرض محدد ومشروع."
            );

        }


        // ---------------------------------------------
        // 6) العملية نفسها لها قرار أساسي
        // ---------------------------------------------

        else {

            decision =
                policy.actions[
                    request.action
                ] ||
                "denied";


            if (
                decision ===
                "allowed"
            ) {

                reasons.push(
                    `الإدارة والنظام والعملية تقع ضمن صلاحيات مجال ${policy.label}.`
                );

            }


            if (
                decision ===
                "masked"
            ) {

                reasons.push(
                    `الوصول يقع ضمن مجال ${policy.label}، لكن العرض يتم بصورة محمية مع إخفاء القيم الشخصية غير اللازمة.`
                );


                controls.push(
                    "إخفاء أو تقليل ظهور البيانات الشخصية أثناء العرض."
                );

            }


            if (
                decision ===
                "approval"
            ) {

                reasons.push(
                    `العملية المطلوبة (${Core.ACTION_LABELS[request.action] || request.action}) على ملف ضمن مجال ${policy.label} تحتاج موافقة إضافية قبل التنفيذ.`
                );


                controls.push(
                    "عدم تنفيذ العملية قبل اعتماد الطلب من صاحب الصلاحية."
                );

            }


            if (
                decision ===
                "denied"
            ) {

                reasons.push(
                    "العملية المطلوبة غير مسموح بها ضمن سياسة هذا المجال."
                );

            }


            // -----------------------------------------
            // 7) حجم الطلب
            // -----------------------------------------

            const max =
                Number(
                    policy.maxRecords[
                        request.action
                    ] || 0
                );


            if (
                max > 0 &&
                request.recordCount >
                max * 5
            ) {

                decision =
                    "denied";


                reasons.push(
                    "عدد السجلات يتجاوز الحد المسموح بدرجة كبيرة؛ لذلك تم حجب العملية."
                );


                controls.push(
                    "حجب العملية بسبب تجاوز نطاق الوصول المطلوب."
                );

            }
            else if (
                max > 0 &&
                request.recordCount >
                max
            ) {

                decision =
                    strongerDecision(
                        decision,
                        "approval"
                    );


                reasons.push(
                    "عدد السجلات يتجاوز الحد المعتاد لهذا المجال ويتطلب موافقة إضافية."
                );


                controls.push(
                    "مراجعة حجم البيانات قبل إتاحة العملية."
                );

            }

        }


        // ---------------------------------------------
        // أنواع البيانات الشخصية لا تحدد أهلية المجال.
        // وظيفتها هنا تحديد الحماية المطلوبة فقط.
        // ---------------------------------------------

        if (
            decision !==
            "denied"
        ) {

            reasons.push(
                `تم اكتشاف الأنواع التالية داخل الملف: ${types.join("، ")}. تُستخدم هذه الأنواع لتطبيق الإخفاء والحماية، وليست لتغيير مجال الملف.`
            );


            if (
                request.action ===
                "VIEW" &&
                types.some(
                    type =>
                        [
                            "رقم الهوية",
                            "بيانات التواصل",
                            "بيانات مالية",
                            "بيانات صحية",
                            "بيانات حيوية أو بيومترية",
                            "بيانات الموقع الجغرافي"
                        ].includes(type)
                ) &&
                decision ===
                "allowed"
            ) {

                decision =
                    "masked";


                reasons.push(
                    "يحتوي الملف على قيم شخصية لا يلزم إظهارها كاملة أثناء العرض؛ لذلك طُبق الإخفاء الجزئي."
                );


                controls.push(
                    "إخفاء القيم الشخصية غير اللازمة مع إبقاء الوصول ضمن نطاق العمل."
                );

            }

        }


        if (
            decision ===
            "denied"
        ) {

            controls.push(
                "عدم عرض محتوى الملف للمستخدم."
            );

        }


        controls.push(
            "تسجيل قرار الحماية وأسبابه في سجل أثر."
        );


        return {

            id:
                Core.uid("APR"),

            createdAt:
                new Date().toISOString(),

            request: {
                ...request,
                dataType:
                    types.join("، ")
            },

            classification: {
                level:
                    "personal",

                label:
                    "بيانات شخصية",

                description:
                    `ملف ضمن مجال ${domain.label}`,

                controls: []
            },

            decision,

            decisionMeta:
                Core.DECISIONS[
                    decision
                ],

            reasons:
                Array.from(
                    new Set(
                        reasons
                    )
                ),

            controls:
                Array.from(
                    new Set(
                        controls
                    )
                ),

            evaluatedDataTypes:
                types,

            fileDomain:
                domain,

            typeEvaluations:
                types.map(
                    type => ({
                        dataType:
                            type,

                        decision:
                            decision,

                        decisionLabel:
                            Core.DECISIONS[
                                decision
                            ]?.label ||
                            decision
                    })
                )
        };

    }


    // =====================================================
    // نافذة الإنذار الأمني
    // تظهر عند تجاوز حد السجلات أو محاولة الوصول
    // إلى مجال / نظام غير مصرح به.
    // =====================================================

    function showSecurityWarning(
        request
    ) {

        if (
            !uploadedAnalysis ||
            !uploadedAnalysis.domain
        ) {
            return;
        }


        const domain =
            uploadedAnalysis.domain;


        const policy =
            FILE_DOMAIN_RULES[
                domain.key
            ];


        if (!policy) {
            return;
        }


        let title = "";
        let message = "";
        let detail = "";


        // ---------------------------------------------
        // 1) الإدارة تحاول الوصول إلى مجال ليس لها
        // ---------------------------------------------

        if (
            request.department !==
            "الخصوصية والالتزام" &&
            !policy.departments.includes(
                request.department
            )
        ) {

            title =
                "محاولة وصول غير مصرح بها";


            message =
                `إدارة ${request.department} غير مخولة بالوصول إلى ${policy.label}.`;


            detail =
                "تم حجب العملية وتسجيل محاولة الوصول في سجل الحماية.";

        }


        // ---------------------------------------------
        // 2) النظام المختار ليس من أنظمة المجال
        // ---------------------------------------------

        else if (
            request.department !==
            "الخصوصية والالتزام" &&
            !policy.systems.includes(
                request.system
            )
        ) {

            title =
                "ليس لديك صلاحية لهذا النظام";


            message =
                `النظام المختار غير مصرح له بالوصول إلى ${policy.label}.`;


            detail =
                "تم منع العملية لأن النظام المستخدم خارج نطاق الصلاحية المسموح.";

        }


        // ---------------------------------------------
        // 3) تجاوز عدد السجلات المسموح للعملية
        // ---------------------------------------------

        else {

            const max =
                Number(
                    policy.maxRecords[
                        request.action
                    ] || 0
                );


            const requested =
                Number(
                    request.recordCount || 0
                );


            if (
                max > 0 &&
                requested > max
            ) {

                title =
                    "تم تجاوز الحد المسموح للبيانات";


                message =
                    `عدد السجلات في الملف ${requested.toLocaleString("ar-SA")} سجل، بينما الحد المسموح لهذه العملية هو ${max.toLocaleString("ar-SA")} سجل.`;


                detail =
                    "تم إيقاف التنفيذ المباشر لحماية البيانات من الوصول خارج النطاق المسموح.";

            }

        }


        // لا توجد مخالفة تحتاج إنذارًا
        if (!title) {
            return;
        }


        const previousWarning =
            document.getElementById(
                "athar-security-warning"
            );


        if (previousWarning) {
            previousWarning.remove();
        }


        const overlay =
            document.createElement(
                "div"
            );


        overlay.id =
            "athar-security-warning";


        overlay.setAttribute(
            "role",
            "alertdialog"
        );


        overlay.setAttribute(
            "aria-modal",
            "true"
        );


        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 2147483647;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: rgba(15, 23, 42, 0.62);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
        `;


        overlay.innerHTML = `

            <div
                dir="rtl"
                style="
                    position: relative;
                    width: min(520px, 100%);
                    box-sizing: border-box;
                    padding: 38px 32px 30px;
                    background: #ffffff;
                    border: 1px solid #fecaca;
                    border-radius: 24px;
                    box-shadow: 0 30px 80px rgba(15, 23, 42, 0.30);
                    text-align: center;
                    font-family: inherit;
                "
            >

                <button
                    type="button"
                    id="athar-warning-close"
                    aria-label="إغلاق التنبيه"
                    style="
                        position: absolute;
                        top: 15px;
                        left: 17px;
                        width: 36px;
                        height: 36px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 0;
                        border: 0;
                        border-radius: 50%;
                        background: #f3f4f6;
                        color: #64748b;
                        font-size: 25px;
                        line-height: 1;
                        cursor: pointer;
                        font-family: inherit;
                    "
                >
                    ×
                </button>


                <div
                    style="
                        width: 72px;
                        height: 72px;
                        margin: 0 auto 16px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border: 2px solid #fecaca;
                        border-radius: 50%;
                        background: #fff1f2;
                        color: #dc2626;
                        font-size: 40px;
                        font-weight: 900;
                    "
                >
                    !
                </div>


                <div
                    style="
                        margin-bottom: 7px;
                        color: #dc2626;
                        font-size: 13px;
                        font-weight: 800;
                    "
                >
                    تنبيه أمني
                </div>


                <h2
                    style="
                        margin: 0 0 12px;
                        color: #17233f;
                        font-size: 25px;
                        line-height: 1.5;
                    "
                >
                    ${Core.escapeHTML(title)}
                </h2>


                <p
                    style="
                        margin: 0 auto 16px;
                        color: #596579;
                        font-size: 15px;
                        line-height: 1.9;
                    "
                >
                    ${Core.escapeHTML(message)}
                </p>


                <div
                    style="
                        margin-bottom: 20px;
                        padding: 13px 16px;
                        border: 1px solid #fee2e2;
                        border-radius: 12px;
                        background: #fff7f7;
                        color: #b4232a;
                        font-size: 13px;
                        line-height: 1.8;
                    "
                >
                    ${Core.escapeHTML(detail)}
                </div>


                <div
                    style="
                        display: grid;
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                        gap: 10px;
                        margin-bottom: 24px;
                    "
                >

                    <div
                        style="
                            padding: 13px 8px;
                            border: 1px solid #e8ebf2;
                            border-radius: 12px;
                            background: #f8f9fc;
                        "
                    >
                        <small
                            style="
                                display: block;
                                margin-bottom: 5px;
                                color: #8a94a6;
                                font-size: 11px;
                            "
                        >
                            الإدارة
                        </small>

                        <strong
                            style="
                                display: block;
                                color: #17233f;
                                font-size: 12px;
                                word-break: break-word;
                            "
                        >
                            ${Core.escapeHTML(request.department || "غير محدد")}
                        </strong>
                    </div>


                    <div
                        style="
                            padding: 13px 8px;
                            border: 1px solid #e8ebf2;
                            border-radius: 12px;
                            background: #f8f9fc;
                        "
                    >
                        <small
                            style="
                                display: block;
                                margin-bottom: 5px;
                                color: #8a94a6;
                                font-size: 11px;
                            "
                        >
                            النظام
                        </small>

                        <strong
                            style="
                                display: block;
                                color: #17233f;
                                font-size: 12px;
                                word-break: break-word;
                            "
                        >
                            ${Core.escapeHTML(request.system || "غير محدد")}
                        </strong>
                    </div>


                    <div
                        style="
                            padding: 13px 8px;
                            border: 1px solid #e8ebf2;
                            border-radius: 12px;
                            background: #f8f9fc;
                        "
                    >
                        <small
                            style="
                                display: block;
                                margin-bottom: 5px;
                                color: #8a94a6;
                                font-size: 11px;
                            "
                        >
                            عدد السجلات
                        </small>

                        <strong
                            style="
                                display: block;
                                color: #17233f;
                                font-size: 12px;
                                word-break: break-word;
                            "
                        >
                            ${Number(request.recordCount || 0).toLocaleString("ar-SA")}
                        </strong>
                    </div>

                </div>


                <button
                    type="button"
                    id="athar-warning-confirm"
                    style="
                        min-width: 150px;
                        padding: 12px 34px;
                        border: 0;
                        border-radius: 12px;
                        background: linear-gradient(135deg, #5f63f2, #7547f5);
                        color: #ffffff;
                        font-family: inherit;
                        font-size: 14px;
                        font-weight: 800;
                        cursor: pointer;
                    "
                >
                    فهمت
                </button>

            </div>

        `;


        document.body.appendChild(
            overlay
        );


        const closeWarning =
            function () {

                overlay.remove();

            };


        document.getElementById(
            "athar-warning-close"
        )
            .addEventListener(
                "click",
                closeWarning
            );


        document.getElementById(
            "athar-warning-confirm"
        )
            .addEventListener(
                "click",
                closeWarning
            );


        overlay.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    overlay
                ) {
                    closeWarning();
                }

            }
        );

    }


    // =====================================================
    // تنفيذ الفحص
    // =====================================================

    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            selectedClassification =
                getSelectedClassification();


            if (
                !selectedClassification
            ) {

                classificationValidation.textContent =
                    "يرجى اختيار مستوى تصنيف البيانات قبل تنفيذ الفحص.";

                return;

            }


            if (
                !uploadedAnalysis ||
                !uploadedAnalysis.detectedTypes.length
            ) {

                showStep(1);

                return;

            }


            const request =
                Object.fromEntries(
                    new FormData(
                        form
                    ).entries()
                );


            request.recordCount =
                uploadedAnalysis.rowCount;


            let result =
                evaluateAllDetectedTypes(
                    request
                );


            result =
                applyClassificationToResult(
                    result
                );


            result.fileAnalysis = {
                fileName:
                    uploadedAnalysis.fileName,

                rowCount:
                    uploadedAnalysis.rowCount,

                columnCount:
                    uploadedAnalysis.columnCount,

                detectedTypes:
                    uploadedAnalysis.detectedTypes,

                domain:
                    uploadedAnalysis.domain,

                detectedFields:
                    uploadedAnalysis.detectedFields
                        .map(
                            item => ({
                                header:
                                    item.header,

                                type:
                                    item.type,

                                confidence:
                                    item.confidence,

                                reason:
                                    item.reason
                            })
                        )
            };


            Core.saveProtectionEvent(
                result
            );


            renderDecision(
                result
            );


            showStep(3);


            showSecurityWarning(
                request
            );

        }
    );



    // =====================================================
    // الرجوع / فحص ملف جديد
    // =====================================================

    document.getElementById(
        "back-to-request"
    )
        .addEventListener(
            "click",
            function () {

                showStep(2);

            }
        );



    document.getElementById(
        "start-new-check"
    )
        .addEventListener(
            "click",
            function () {

                uploadedAnalysis =
                    null;


                selectedClassification =
                    "";


                form.reset();


                classificationInputs.forEach(
                    input => {

                        input.checked =
                            false;

                    }
                );


                updateClassificationChoice();


                analysisResult.hidden =
                    true;


                analysisValidation.textContent =
                    "";


                emptyState.hidden =
                    false;


                resultBox.hidden =
                    true;


                resultBox.innerHTML =
                    "";


                showStep(1);

            }
        );



    // =====================================================
    // بدء الصفحة
    // =====================================================

    updateClassificationChoice();
    showStep(1);


})();
