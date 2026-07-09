// IT Asset Management - Application Controller (Vanilla JS)
// Hybrid Mode: Fallback to Browser LocalStorage if Go backend is not running
// Added Custom Fields, Direct Asset Transfer, Conditional Fields, and QR Code tags

document.addEventListener("DOMContentLoaded", () => {
    // Initial static mock assets data for LocalStorage fallback (Updated Schema)
    const INITIAL_ASSETS = [
        {
            "id": "AST-0001",
            "name": "MacBook Pro 16-inch M3",
            "category": "Laptop",
            "brand": "Apple",
            "model": "M3 Pro (18GB RAM, 512GB SSD)",
            "serialNumber": "C02FG123Q001",
            "purchaseDate": "2024-01-15",
            "purchaseCost": 54990000,
            "status": "Active",
            "assignedTo": "Nguyễn Văn An",
            "department": "Engineering",
            "company": "SeaCorp",
            "storageLocation": "Kho IT, Văn phòng HCM",
            "usageLocation": "Bàn làm việc Lầu 5, Văn phòng HCM",
            "disposalDate": "",
            "maintenanceReason": "",
            "notes": "Máy kèm sạc MagSafe 140W và túi chống sốc.",
            "customFields": {
                "he_dieu_hanh": "macOS Sonoma 14",
                "ram_gb": 18,
                "dung_luong_o_cung": "512 GB SSD"
            }
        },
        {
            "id": "AST-0002",
            "name": "Dell XPS 15 9530",
            "category": "Laptop",
            "brand": "Dell",
            "model": "Core i7-13700H / 16GB / 512GB / RTX 4050",
            "serialNumber": "8X9Y1Z2",
            "purchaseDate": "2024-03-10",
            "purchaseCost": 42500000,
            "status": "Available",
            "assignedTo": "",
            "department": "",
            "company": "DannyGreen",
            "storageLocation": "Kho IT, Văn phòng HCM",
            "usageLocation": "",
            "disposalDate": "",
            "maintenanceReason": "",
            "notes": "Hộp đầy đủ phụ kiện, đã cài lại Windows 11 sạch.",
            "customFields": {
                "he_dieu_hanh": "Windows 11 Home",
                "ram_gb": 16,
                "dung_luong_o_cung": "512 GB SSD"
            }
        },
        {
            "id": "AST-0003",
            "name": "ThinkPad X1 Carbon Gen 11",
            "category": "Laptop",
            "brand": "Lenovo",
            "model": "Core i7-1355U / 32GB / 1TB SSD",
            "serialNumber": "L3-K4567",
            "purchaseDate": "2023-11-05",
            "purchaseCost": 48000000,
            "status": "Active",
            "assignedTo": "Trần Thị Bình",
            "department": "Finance",
            "company": "Seatek",
            "storageLocation": "Kho IT, Chi nhánh HN",
            "usageLocation": "Bàn làm việc Lầu 2, Văn phòng Hà Nội",
            "disposalDate": "",
            "maintenanceReason": "",
            "notes": "Bàn phím tiếng Anh, máy siêu nhẹ.",
            "customFields": {
                "he_dieu_hanh": "Windows 11 Pro",
                "ram_gb": 32,
                "dung_luong_o_cung": "1 TB NVMe SSD"
            }
        },
        {
            "id": "AST-0004",
            "name": "Dell UltraSharp 27 U2723QE",
            "category": "Monitor",
            "brand": "Dell",
            "model": "27-inch 4K USB-C Hub Monitor",
            "serialNumber": "CN-0F391Y-12345",
            "purchaseDate": "2024-02-20",
            "purchaseCost": 11500000,
            "status": "Active",
            "assignedTo": "Nguyễn Văn An",
            "department": "Engineering",
            "company": "SeaCorp",
            "storageLocation": "Kho IT, Văn phòng HCM",
            "usageLocation": "Bàn làm việc Lầu 5, Văn phòng HCM",
            "disposalDate": "",
            "maintenanceReason": "",
            "notes": "Kết nối Type-C cấp nguồn cho Macbook.",
            "customFields": {
                "he_dieu_hanh": "N/A",
                "ram_gb": 0,
                "dung_luong_o_cung": "N/A"
            }
        },
        {
            "id": "AST-0005",
            "name": "Ubiquiti UniFi AP AC Pro",
            "category": "Network",
            "brand": "Ubiquiti",
            "model": "UAP-AC-PRO",
            "serialNumber": "U-AP-PRO-9988",
            "purchaseDate": "2023-06-12",
            "purchaseCost": 3800000,
            "status": "Active",
            "assignedTo": "",
            "department": "IT Infrastructure",
            "company": "Seatek",
            "storageLocation": "Kho IT, Văn phòng HCM",
            "usageLocation": "Hành lang Tầng 3, Văn phòng HCM",
            "disposalDate": "",
            "maintenanceReason": "",
            "notes": "Thiết bị phát sóng Wifi văn phòng chính.",
            "customFields": {}
        },
        {
            "id": "AST-0006",
            "name": "Server HP ProLiant DL360 Gen10",
            "category": "Server",
            "brand": "HP",
            "model": "Intel Xeon 4210R / 64GB RAM / 2x1.2TB SAS",
            "serialNumber": "SGH123ABC4",
            "purchaseDate": "2022-09-01",
            "purchaseCost": 85000000,
            "status": "Maintenance",
            "assignedTo": "",
            "department": "IT Operations",
            "company": "SeaCorp",
            "storageLocation": "Phòng Server Lầu 3, Văn phòng HCM",
            "usageLocation": "Phòng Server Lầu 3, Văn phòng HCM",
            "disposalDate": "",
            "maintenanceReason": "Hỏng ổ cứng SSD số 2, đang gửi hãng bảo hành",
            "notes": "Đang bị lỗi ổ cứng số 2, chờ nhà cung cấp bảo hành thay thế.",
            "customFields": {
                "ram_gb": 64,
                "dung_luong_o_cung": "2.4 TB HDD SAS"
            }
        },
        {
            "id": "AST-0007",
            "name": "Office 365 Business Premium",
            "category": "License",
            "brand": "Microsoft",
            "model": "Hạn đăng ký năm (50 Users)",
            "serialNumber": "MS-O365-PREM-2026",
            "purchaseDate": "2025-05-10",
            "purchaseCost": 35000000,
            "status": "Active",
            "assignedTo": "Toàn công ty",
            "department": "Administration",
            "company": "SeaCorp",
            "storageLocation": "Cloud Admin Portal",
            "usageLocation": "Cloud / Toàn hệ thống công ty",
            "disposalDate": "",
            "maintenanceReason": "",
            "notes": "Gia hạn tự động hàng năm vào ngày 10/05.",
            "customFields": {}
        },
        {
            "id": "AST-0008",
            "name": "iPad Pro 11-inch M2",
            "category": "Mobile",
            "brand": "Apple",
            "model": "Wi-Fi + Cellular 128GB",
            "serialNumber": "DLXG123456",
            "purchaseDate": "2023-08-18",
            "purchaseCost": 24000000,
            "status": "Disposed",
            "assignedTo": "",
            "department": "",
            "company": "DannyGreen",
            "storageLocation": "",
            "usageLocation": "N/A",
            "disposalDate": "2026-05-15",
            "maintenanceReason": "",
            "notes": "Hỏng màn hình do rơi vỡ, chi phí sửa cao nên đã làm thủ tục thanh lý tháng 05/2026.",
            "customFields": {
                "he_dieu_hanh": "iPadOS 17"
            }
        }
    ];

    const INITIAL_LOGS = [
        {
            "timestamp": "2026-07-09T08:30:00+07:00",
            "action": "Khởi tạo hệ thống",
            "assetId": "-",
            "assetName": "Hệ thống Quản lý tài sản IT",
            "operator": "Hệ thống",
            "details": "Đã nhập dữ liệu tài sản ban đầu vào cơ sở dữ liệu."
        },
        {
            "timestamp": "2026-07-09T09:15:00+07:00",
            "action": "Cấp phát tài sản",
            "assetId": "AST-0001",
            "assetName": "MacBook Pro 16-inch M3",
            "operator": "Lê Minh Tâm (IT Manager)",
            "details": "Đã cấp phát máy MacBook cho Nguyễn Văn An (Phòng Engineering)."
        },
        {
            "timestamp": "2026-07-09T09:20:00+07:00",
            "action": "Cấp phát tài sản",
            "assetId": "AST-0004",
            "assetName": "Dell UltraSharp 27 U2723QE",
            "operator": "Lê Minh Tâm (IT Manager)",
            "details": "Đã cấp phát màn hình Dell kèm dây USB-C cho Nguyễn Văn An."
        },
        {
            "timestamp": "2026-07-09T10:00:00+07:00",
            "action": "Gửi đi bảo trì",
            "assetId": "AST-0006",
            "assetName": "Server HP ProLiant DL360 Gen10",
            "operator": "Lê Minh Tâm (IT Manager)",
            "details": "Ghi nhận lỗi hỏng ổ cứng SSD số 2. Đã tạo yêu cầu gửi bảo hành tới nhà cung cấp HP."
        },
        {
            "timestamp": "2026-07-09T11:45:00+07:00",
            "action": "Thanh lý tài sản",
            "assetId": "AST-0008",
            "assetName": "iPad Pro 11-inch M2",
            "operator": "Lê Minh Tâm (IT Manager)",
            "details": "Thực hiện thanh lý thiết bị hỏng màn hình do rơi vỡ. Số hồ sơ: TL-2026-08."
        }
    ];

    const INITIAL_CUSTOM_FIELDS = [
        { "key": "he_dieu_hanh", "label": "Hệ điều hành", "type": "text" },
        { "key": "ram_gb", "label": "Dung lượng RAM (GB)", "type": "number" },
        { "key": "dung_luong_o_cung", "label": "Dung lượng ổ cứng", "type": "text" }
    ];

    // State management
    const state = {
        assets: [],
        logs: [],
        customFields: [],
        activeTab: "dashboard",
        theme: localStorage.getItem("theme") || "dark",
        editingAssetId: null
    };

    // Auto-detect browser vs server environment
    const isLocalFile = window.location.protocol === "file:";
    let useLocalStorage = isLocalFile;

    // Check offline mode or backend failure
    if (useLocalStorage) {
        initLocalStorage();
    }

    function initLocalStorage() {
        if (!localStorage.getItem("it_assets")) {
            localStorage.setItem("it_assets", JSON.stringify(INITIAL_ASSETS));
        }
        if (!localStorage.getItem("it_logs")) {
            localStorage.setItem("it_logs", JSON.stringify(INITIAL_LOGS));
        }
        if (!localStorage.getItem("it_custom_fields")) {
            localStorage.setItem("it_custom_fields", JSON.stringify(INITIAL_CUSTOM_FIELDS));
        }
    }

    function writeLocalStorageLog(action, assetId, assetName, operator, details) {
        initLocalStorage();
        let logsList = JSON.parse(localStorage.getItem("it_logs") || "[]");
        const newLog = {
            timestamp: new Date().toISOString(),
            action: action,
            assetId: assetId,
            assetName: assetName,
            operator: operator || "Admin IT",
            details: details
        };
        logsList.unshift(newLog);
        localStorage.setItem("it_logs", JSON.stringify(logsList));
    }

    // Category Color Mapping
    const CATEGORY_COLORS = {
        "Laptop": "#ab6df0",
        "Desktop": "#00e676",
        "Server": "#ff9100",
        "Monitor": "#00b0ff",
        "Network": "#00f2fe",
        "License": "#e040fb",
        "Mobile": "#ff1744",
        "Other": "#90a4ae"
    };

    const STATUS_TEXTS = {
        "Active": "Đang cấp phát",
        "Available": "Sẵn sàng sử dụng",
        "Maintenance": "Đang bảo trì",
        "Disposed": "Đã thanh lý"
    };

    const FIELD_TYPES = {
        "text": "Chữ (Text)",
        "number": "Số (Number)",
        "date": "Ngày tháng (Date)",
        "boolean": "Đúng / Sai (Boolean)"
    };

    // DOM Elements
    const elements = {
        body: document.body,
        themeToggle: document.getElementById("theme-toggle"),
        systemTime: document.getElementById("system-time"),
        
        tabDashboard: document.getElementById("btn-tab-dashboard"),
        tabAssets: document.getElementById("btn-tab-assets"),
        tabLogs: document.getElementById("btn-tab-logs"),
        tabFields: document.getElementById("btn-tab-fields"),
        
        panelDashboard: document.getElementById("panel-dashboard"),
        panelAssets: document.getElementById("panel-assets"),
        panelLogs: document.getElementById("panel-logs"),
        panelFields: document.getElementById("panel-fields"),
        pageTitle: document.getElementById("page-title"),
        pageSubtitle: document.getElementById("page-subtitle"),
        
        statTotal: document.getElementById("stat-total"),
        statActive: document.getElementById("stat-active"),
        statAvailable: document.getElementById("stat-available"),
        statMaintenance: document.getElementById("stat-maintenance"),
        
        recentActivities: document.getElementById("recent-activities"),
        btnViewAllLogs: document.getElementById("btn-view-all-logs"),
        chartTotalValue: document.getElementById("chart-total-value"),
        categoryChartContainer: document.getElementById("category-chart-container"),
        categoryChartLegend: document.getElementById("category-chart-legend"),
        categoryPieChart: document.getElementById("category-pie-chart"),
        
        inputSearchAssets: document.getElementById("input-search-assets"),
        selectFilterCategory: document.getElementById("select-filter-category"),
        selectFilterStatus: document.getElementById("select-filter-status"),
        btnAddAssetModal: document.getElementById("btn-add-asset-modal"),
        tbodyAssets: document.getElementById("tbody-assets"),
        
        inputSearchLogs: document.getElementById("input-search-logs"),
        tbodyLogs: document.getElementById("tbody-logs"),

        // Tab Fields Elements
        tbodyCustomFields: document.getElementById("tbody-custom-fields"),
        formCreateField: document.getElementById("form-create-field"),
        newFieldLabel: document.getElementById("new-field-label"),
        newFieldKey: document.getElementById("new-field-key"),
        newFieldType: document.getElementById("new-field-type"),
        
        // Modal - Asset Add/Edit
        modalAsset: document.getElementById("modal-asset"),
        modalAssetTitle: document.getElementById("modal-asset-title"),
        formAsset: document.getElementById("form-asset"),
        assetId: document.getElementById("asset-id"),
        assetName: document.getElementById("asset-name"),
        assetCategory: document.getElementById("asset-category"),
        assetCompany: document.getElementById("asset-company"),
        assetBrand: document.getElementById("asset-brand"),
        assetModel: document.getElementById("asset-model"),
        assetSerial: document.getElementById("asset-serial"),
        assetStatus: document.getElementById("asset-status"),
        assetPurchaseDate: document.getElementById("asset-purchase-date"),
        assetPurchaseCost: document.getElementById("asset-purchase-cost"),
        assetStorageLocation: document.getElementById("asset-storage-location"),
        assetUsageLocation: document.getElementById("asset-usage-location"),
        assetAssignedTo: document.getElementById("asset-assigned-to"),
        assetDepartment: document.getElementById("asset-department"),
        assetNotes: document.getElementById("asset-notes"),
        btnCloseAssetModal: document.getElementById("btn-close-asset-modal"),
        btnCancelAssetForm: document.getElementById("btn-cancel-asset-form"),
        dynamicCustomFieldsContainer: document.getElementById("dynamic-custom-fields-container"),
        titleCustomFieldsSection: document.getElementById("title-custom-fields-section"),
        
        // Conditional status inputs elements
        assetDisposalDate: document.getElementById("asset-disposal-date"),
        assetMaintenanceReason: document.getElementById("asset-maintenance-reason"),
        wrapperDisposalDate: document.getElementById("wrapper-disposal-date"),
        wrapperMaintenanceReason: document.getElementById("wrapper-maintenance-reason"),
        labelStorageLocation: document.getElementById("label-storage-location"),

        // Modal - Assign
        modalAssign: document.getElementById("modal-assign"),
        formAssign: document.getElementById("form-assign"),
        assignAssetId: document.getElementById("assign-asset-id"),
        assignAssetDisplayId: document.getElementById("assign-asset-display-id"),
        assignAssetDisplayName: document.getElementById("assign-asset-display-name"),
        assignToEmployee: document.getElementById("assign-to-employee"),
        assignDepartment: document.getElementById("assign-department"),
        assignUsageLocation: document.getElementById("assign-usage-location"),
        assignOperator: document.getElementById("assign-operator"),
        btnCloseAssignModal: document.getElementById("btn-close-assign-modal"),
        btnCancelAssignForm: document.getElementById("btn-cancel-assign-form"),
        
        // Modal - Return
        modalReturn: document.getElementById("modal-return"),
        formReturn: document.getElementById("form-return"),
        returnAssetId: document.getElementById("return-asset-id"),
        returnAssetDisplayId: document.getElementById("return-asset-display-id"),
        returnAssetDisplayName: document.getElementById("return-asset-display-name"),
        returnStorageLocation: document.getElementById("return-storage-location"),
        returnOperator: document.getElementById("return-operator"),
        btnCloseReturnModal: document.getElementById("btn-close-return-modal"),
        btnCancelReturnForm: document.getElementById("btn-cancel-return-form"),

        // Modal - Details
        modalDetails: document.getElementById("modal-details"),
        btnCloseDetailsModal: document.getElementById("btn-close-details-modal"),
        btnCloseDetailsFooter: document.getElementById("btn-close-details-footer"),
        detailDisplayId: document.getElementById("detail-display-id"),
        detailDisplayName: document.getElementById("detail-display-name"),
        detailDisplayStatus: document.getElementById("detail-display-status"),
        detailValCategory: document.getElementById("detail-val-category"),
        detailValCompany: document.getElementById("detail-val-company"),
        detailValBrand: document.getElementById("detail-val-brand"),
        detailValModel: document.getElementById("detail-val-model"),
        detailValSerial: document.getElementById("detail-val-serial"),
        detailValPurchaseDate: document.getElementById("detail-val-purchase-date"),
        detailValPurchaseCost: document.getElementById("detail-val-purchase-cost"),
        detailValAssignedTo: document.getElementById("detail-val-assigned-to"),
        detailValDepartment: document.getElementById("detail-val-department"),
        detailValStorageLocation: document.getElementById("detail-val-storage-location"),
        detailValUsageLocation: document.getElementById("detail-val-usage-location"),
        detailWrapperStorageLocation: document.getElementById("detail-wrapper-storage-location"),
        detailWrapperUsageLocation: document.getElementById("detail-wrapper-usage-location"),
        detailWrapperDisposalDate: document.getElementById("detail-wrapper-disposal-date"),
        detailValDisposalDate: document.getElementById("detail-val-disposal-date"),
        detailWrapperMaintenanceReason: document.getElementById("detail-wrapper-maintenance-reason"),
        detailValMaintenanceReason: document.getElementById("detail-val-maintenance-reason"),
        detailCustomFieldsTitle: document.getElementById("detail-custom-fields-title"),
        detailCustomFieldsGrid: document.getElementById("detail-custom-fields-grid"),
        detailValNotes: document.getElementById("detail-val-notes"),
        detailQrImage: document.getElementById("detail-qr-image"),
        detailAssetHistoryTimeline: document.getElementById("detail-asset-history-timeline"),

        // Modal - Transfer
        modalTransfer: document.getElementById("modal-transfer"),
        formTransfer: document.getElementById("form-transfer"),
        transferAssetId: document.getElementById("transfer-asset-id"),
        transferAssetDisplayId: document.getElementById("transfer-asset-display-id"),
        transferAssetDisplayName: document.getElementById("transfer-asset-display-name"),
        transferAssetDisplayOldUser: document.getElementById("transfer-asset-display-old-user"),
        transferAssetDisplayCompany: document.getElementById("transfer-asset-display-company"),
        transferToEmployee: document.getElementById("transfer-to-employee"),
        transferDepartment: document.getElementById("transfer-department"),
        transferUsageLocation: document.getElementById("transfer-usage-location"),
        transferOperator: document.getElementById("transfer-operator"),
        btnCloseTransferModal: document.getElementById("btn-close-transfer-modal"),
        btnCancelTransferForm: document.getElementById("btn-cancel-transfer-form"),
        
        // Toast Notification
        toastContainer: document.getElementById("toast-container")
    };

    // Initialize application
    init();

    function init() {
        applyTheme();
        updateTime();
        setInterval(updateTime, 60000);
        
        registerEvents();
        refreshAllData();
        
        if (useLocalStorage) {
            setTimeout(() => {
                showToast("Chế độ Offline", "Đang sử dụng dữ liệu lưu trữ trên trình duyệt (LocalStorage).", "info");
            }, 800);
        }
    }

    function updateTime() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' };
        let dateString = now.toLocaleDateString('vi-VN', options);
        dateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);
        elements.systemTime.querySelector("span").textContent = dateString;
    }

    function applyTheme() {
        elements.body.setAttribute("data-theme", state.theme);
        const icon = elements.themeToggle.querySelector("i");
        if (state.theme === "light") {
            icon.className = "fa-solid fa-sun";
            elements.themeToggle.setAttribute("title", "Chuyển sang Giao diện tối");
        } else {
            icon.className = "fa-solid fa-moon";
            elements.themeToggle.setAttribute("title", "Chuyển sang Giao diện sáng");
        }
    }

    elements.themeToggle.addEventListener("click", () => {
        state.theme = state.theme === "dark" ? "light" : "dark";
        localStorage.setItem("theme", state.theme);
        applyTheme();
    });

    function registerEvents() {
        elements.tabDashboard.addEventListener("click", (e) => switchTab(e, "dashboard"));
        elements.tabAssets.addEventListener("click", (e) => switchTab(e, "assets"));
        elements.tabLogs.addEventListener("click", (e) => switchTab(e, "logs"));
        elements.tabFields.addEventListener("click", (e) => switchTab(e, "fields"));
        elements.btnViewAllLogs.addEventListener("click", (e) => switchTab(e, "logs"));

        elements.inputSearchAssets.addEventListener("input", debounce(filterAndRenderAssets, 300));
        elements.selectFilterCategory.addEventListener("change", filterAndRenderAssets);
        elements.selectFilterStatus.addEventListener("change", filterAndRenderAssets);
        elements.inputSearchLogs.addEventListener("input", debounce(filterAndRenderLogs, 300));

        elements.btnAddAssetModal.addEventListener("click", () => openAssetModal());
        elements.btnCloseAssetModal.addEventListener("click", () => closeAssetModal());
        elements.btnCancelAssetForm.addEventListener("click", () => closeAssetModal());
        
        elements.btnCloseAssignModal.addEventListener("click", () => closeAssignModal());
        elements.btnCancelAssignForm.addEventListener("click", () => closeAssignModal());
        
        elements.btnCloseReturnModal.addEventListener("click", () => closeReturnModal());
        elements.btnCancelReturnForm.addEventListener("click", () => closeReturnModal());

        elements.btnCloseTransferModal.addEventListener("click", () => closeTransferModal());
        elements.btnCancelTransferForm.addEventListener("click", () => closeTransferModal());

        elements.btnCloseDetailsModal.addEventListener("click", () => closeDetailsModal());
        elements.btnCloseDetailsFooter.addEventListener("click", () => closeDetailsModal());

        elements.formAsset.addEventListener("submit", handleAssetFormSubmit);
        elements.formAssign.addEventListener("submit", handleAssignFormSubmit);
        elements.formReturn.addEventListener("submit", handleReturnFormSubmit);
        elements.formTransfer.addEventListener("submit", handleTransferFormSubmit);
        elements.formCreateField.addEventListener("submit", handleCreateFieldSubmit);

        // Dynamic Status Change detection
        elements.assetStatus.addEventListener("change", (e) => {
            toggleStatusFields(e.target.value);
        });

        elements.newFieldKey.addEventListener("input", (e) => {
            let val = e.target.value;
            val = val.toLowerCase()
                     .normalize('NFD')
                     .replace(/[\u0300-\u036f]/g, '')
                     .replace(/đ/g, 'd')
                     .replace(/[^a-z0-9_]/g, '_')
                     .replace(/_+/g, '_');
            e.target.value = val;
        });

        [elements.modalAsset, elements.modalAssign, elements.modalReturn, elements.modalDetails, elements.modalTransfer].forEach(modal => {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) {
                    closeModal(modal);
                }
            });
        });
    }

    function toggleStatusFields(status) {
        if (status === "Disposed") {
            elements.wrapperDisposalDate.style.display = "block";
            elements.wrapperMaintenanceReason.style.display = "none";
            
            elements.assetDisposalDate.required = true;
            elements.assetMaintenanceReason.required = false;
            
            // Storage Location is NOT required for Disposed status
            elements.assetStorageLocation.required = false;
            elements.labelStorageLocation.innerHTML = `Vị trí lưu trữ (Kho)`;
        } else if (status === "Maintenance") {
            elements.wrapperDisposalDate.style.display = "none";
            elements.wrapperMaintenanceReason.style.display = "block";
            
            elements.assetDisposalDate.required = false;
            elements.assetMaintenanceReason.required = true;
            
            elements.assetStorageLocation.required = true;
            elements.labelStorageLocation.innerHTML = `Vị trí lưu trữ (Kho) <span class="required">*</span>`;
        } else {
            // Available or Active
            elements.wrapperDisposalDate.style.display = "none";
            elements.wrapperMaintenanceReason.style.display = "none";
            
            elements.assetDisposalDate.required = false;
            elements.assetMaintenanceReason.required = false;
            
            elements.assetStorageLocation.required = true;
            elements.labelStorageLocation.innerHTML = `Vị trí lưu trữ (Kho) <span class="required">*</span>`;
        }
    }

    function switchTab(e, tabName) {
        if (e) e.preventDefault();
        state.activeTab = tabName;
        
        elements.tabDashboard.classList.remove("active");
        elements.tabAssets.classList.remove("active");
        elements.tabLogs.classList.remove("active");
        elements.tabFields.classList.remove("active");

        elements.panelDashboard.classList.remove("active");
        elements.panelAssets.classList.remove("active");
        elements.panelLogs.classList.remove("active");
        elements.panelFields.classList.remove("active");

        if (tabName === "dashboard") {
            elements.tabDashboard.classList.add("active");
            elements.panelDashboard.classList.add("active");
            elements.pageTitle.textContent = "Hệ thống Quản lý Tài sản IT";
            elements.pageSubtitle.textContent = "Tổng quan trạng thái thiết bị và phần mềm";
            renderDashboard();
        } else if (tabName === "assets") {
            elements.tabAssets.classList.add("active");
            elements.panelAssets.classList.add("active");
            elements.pageTitle.textContent = "Danh mục Tài sản IT";
            elements.pageSubtitle.textContent = "Quản lý chi tiết danh sách thiết bị phần cứng & giấy phép";
            filterAndRenderAssets();
        } else if (tabName === "logs") {
            elements.tabLogs.classList.add("active");
            elements.panelLogs.classList.add("active");
            elements.pageTitle.textContent = "Nhật ký hoạt động";
            elements.pageSubtitle.textContent = "Lịch sử chi tiết về vòng đời và bàn giao tài sản";
            filterAndRenderLogs();
        } else if (tabName === "fields") {
            elements.tabFields.classList.add("active");
            elements.panelFields.classList.add("active");
            elements.pageTitle.textContent = "Cấu hình trường tùy chỉnh";
            elements.pageSubtitle.textContent = "Tùy biến cấu trúc dữ liệu tài sản theo nhu cầu doanh nghiệp";
            renderCustomFieldsConfig();
        }
    }

    async function refreshAllData() {
        try {
            await Promise.all([
                fetchAssets(),
                fetchLogs(),
                fetchCustomFields()
            ]);
            
            if (state.activeTab === "dashboard") renderDashboard();
            else if (state.activeTab === "assets") filterAndRenderAssets();
            else if (state.activeTab === "logs") filterAndRenderLogs();
            else if (state.activeTab === "fields") renderCustomFieldsConfig();
        } catch (err) {
            console.error("Dữ liệu mạng lỗi:", err);
        }
    }

    async function fetchAssets() {
        if (useLocalStorage) {
            initLocalStorage();
            state.assets = JSON.parse(localStorage.getItem("it_assets") || "[]");
        } else {
            try {
                const response = await fetch("/api/assets");
                if (!response.ok) throw new Error("API error");
                state.assets = await response.json();
            } catch (err) {
                useLocalStorage = true;
                initLocalStorage();
                state.assets = JSON.parse(localStorage.getItem("it_assets") || "[]");
            }
        }
    }

    async function fetchLogs() {
        if (useLocalStorage) {
            initLocalStorage();
            state.logs = JSON.parse(localStorage.getItem("it_logs") || "[]");
        } else {
            try {
                const response = await fetch("/api/logs");
                if (!response.ok) throw new Error("API error");
                state.logs = await response.json();
            } catch (err) {
                useLocalStorage = true;
                initLocalStorage();
                state.logs = JSON.parse(localStorage.getItem("it_logs") || "[]");
            }
        }
    }

    async function fetchCustomFields() {
        if (useLocalStorage) {
            initLocalStorage();
            state.customFields = JSON.parse(localStorage.getItem("it_custom_fields") || "[]");
        } else {
            try {
                const response = await fetch("/api/fields");
                if (!response.ok) throw new Error("API error");
                state.customFields = await response.json();
            } catch (err) {
                useLocalStorage = true;
                initLocalStorage();
                state.customFields = JSON.parse(localStorage.getItem("it_custom_fields") || "[]");
            }
        }
    }

    function renderDashboard() {
        const total = state.assets.length;
        const active = state.assets.filter(a => a.status === "Active").length;
        const available = state.assets.filter(a => a.status === "Available").length;
        const maintenance = state.assets.filter(a => a.status === "Maintenance").length;

        elements.statTotal.textContent = total;
        elements.statActive.textContent = active;
        elements.statAvailable.textContent = available;
        elements.statMaintenance.textContent = maintenance;
        elements.chartTotalValue.textContent = total;

        renderCategoryPieChart();
        renderRecentActivities();
    }

    function renderCategoryPieChart() {
        const catCounts = {};
        state.assets.forEach(ast => {
            const cat = ast.category || "Other";
            catCounts[cat] = (catCounts[cat] || 0) + 1;
        });

        const total = state.assets.length;
        const svg = elements.categoryPieChart;
        const segments = svg.querySelectorAll(".chart-segment");
        segments.forEach(s => s.remove());

        if (total === 0) {
            elements.categoryChartLegend.innerHTML = `<div style="grid-column: span 2; text-align: center; color: var(--text-muted); font-size: 13px;">Không có tài sản nào</div>`;
            return;
        }

        const data = Object.keys(catCounts).map(cat => ({
            name: cat,
            count: catCounts[cat],
            percentage: (catCounts[cat] / total) * 100
        })).sort((a, b) => b.count - a.count);

        let runningPercentage = 0;
        const r = 70;
        const cx = 100;
        const cy = 100;
        const circumference = 2 * Math.PI * r;

        let legendHTML = "";

        data.forEach(item => {
            const color = CATEGORY_COLORS[item.name] || CATEGORY_COLORS["Other"];
            const strokeDashArray = `${(item.percentage / 100) * circumference} ${circumference}`;
            const strokeDashOffset = - (runningPercentage / 100) * circumference;

            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("class", "chart-segment");
            circle.setAttribute("r", r);
            circle.setAttribute("cx", cx);
            circle.setAttribute("cy", cy);
            circle.setAttribute("fill", "transparent");
            circle.setAttribute("stroke", color);
            circle.setAttribute("stroke-width", "20");
            circle.setAttribute("stroke-dasharray", strokeDashArray);
            circle.setAttribute("stroke-dashoffset", strokeDashOffset);
            circle.setAttribute("transform", `rotate(-90 ${cx} ${cy})`);
            
            circle.addEventListener("click", () => {
                elements.selectFilterCategory.value = item.name;
                switchTab(null, "assets");
            });

            svg.appendChild(circle);
            runningPercentage += item.percentage;

            legendHTML += `
                <div class="legend-item" style="cursor: pointer;" onclick="filterByCategory('${item.name}')">
                    <span class="legend-color" style="background-color: ${color};"></span>
                    <span class="name">${item.name}</span>
                    <span class="count">${item.count}</span>
                </div>
            `;
        });

        elements.categoryChartLegend.innerHTML = legendHTML;
    }

    window.filterByCategory = (cat) => {
        elements.selectFilterCategory.value = cat;
        switchTab(null, "assets");
    };

    window.filterAssetsByStatus = (status) => {
        elements.selectFilterStatus.value = status;
        switchTab(null, "assets");
    };

    function renderRecentActivities() {
        const recentLogs = state.logs.slice(0, 5);
        
        if (recentLogs.length === 0) {
            elements.recentActivities.innerHTML = `<p style="text-align: center; color: var(--text-muted); font-size: 13px; padding-top: 20px;">Chưa có hoạt động nào được ghi lại.</p>`;
            return;
        }

        let html = "";
        recentLogs.forEach(log => {
            let actionClass = "add";
            if (log.action.includes("Cấp phát")) actionClass = "assign";
            else if (log.action.includes("Thu hồi")) actionClass = "return";
            else if (log.action.includes("Điều chuyển")) actionClass = "return";
            else if (log.action.includes("bảo trì") || log.action.includes("Bảo trì")) actionClass = "maintenance";
            else if (log.action.includes("Thanh lý") || log.action.includes("Xóa") || log.action.includes("trường")) actionClass = "dispose";

            const formattedTime = formatLogDate(log.timestamp);
            
            html += `
                <div class="timeline-item ${actionClass}">
                    <div class="timeline-marker"></div>
                    <div class="timeline-content">
                        <div class="timeline-header">
                            <span class="timeline-title">${log.action}</span>
                            <span class="timeline-time">${formattedTime}</span>
                        </div>
                        <div class="timeline-desc">
                            Tài sản: <strong>${log.assetId} - ${log.assetName}</strong>. <br>
                            ${log.details} <span style="display:block; font-size: 10px; color: var(--accent); margin-top:4px;">Người thực hiện: ${log.operator}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        elements.recentActivities.innerHTML = html;
    }

    function formatLogDate(isoString) {
        if (!isoString) return "";
        try {
            const date = new Date(isoString);
            return date.toLocaleString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            return isoString;
        }
    }

    function filterAndRenderAssets() {
        const searchQuery = elements.inputSearchAssets.value.trim().toLowerCase();
        const categoryFilter = elements.selectFilterCategory.value;
        const statusFilter = elements.selectFilterStatus.value;

        const filtered = state.assets.filter(ast => {
            const matchesCategory = categoryFilter === "" || ast.category === categoryFilter;
            const matchesStatus = statusFilter === "" || ast.status === statusFilter;
            
            let matchesSearch = true;
            if (searchQuery !== "") {
                matchesSearch = 
                    (ast.id && ast.id.toLowerCase().includes(searchQuery)) ||
                    (ast.name && ast.name.toLowerCase().includes(searchQuery)) ||
                    (ast.serialNumber && ast.serialNumber.toLowerCase().includes(searchQuery)) ||
                    (ast.brand && ast.brand.toLowerCase().includes(searchQuery)) ||
                    (ast.model && ast.model.toLowerCase().includes(searchQuery)) ||
                    (ast.assignedTo && ast.assignedTo.toLowerCase().includes(searchQuery)) ||
                    (ast.department && ast.department.toLowerCase().includes(searchQuery)) ||
                    (ast.company && ast.company.toLowerCase().includes(searchQuery)) ||
                    (ast.storageLocation && ast.storageLocation.toLowerCase().includes(searchQuery)) ||
                    (ast.usageLocation && ast.usageLocation.toLowerCase().includes(searchQuery)) ||
                    (ast.disposalDate && ast.disposalDate.toLowerCase().includes(searchQuery)) ||
                    (ast.maintenanceReason && ast.maintenanceReason.toLowerCase().includes(searchQuery));
                
                if (!matchesSearch && ast.customFields) {
                    for (let key in ast.customFields) {
                        const val = ast.customFields[key];
                        if (val && String(val).toLowerCase().includes(searchQuery)) {
                            matchesSearch = true;
                            break;
                        }
                    }
                }
            }

            return matchesCategory && matchesStatus && matchesSearch;
        });

        renderAssetsTable(filtered);
    }

    function renderAssetsTable(assetsList) {
        if (assetsList.length === 0) {
            elements.tbodyAssets.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center" style="padding: 40px; color: var(--text-muted);">
                        <i class="fa-regular fa-folder-open" style="font-size: 24px; margin-bottom: 8px; display: block; color: var(--accent);"></i>
                        Không tìm thấy tài sản nào phù hợp với bộ lọc.
                    </td>
                </tr>
            `;
            return;
        }

        let html = "";
        assetsList.forEach(ast => {
            const statusClass = ast.status ? ast.status.toLowerCase() : "available";
            const statusText = STATUS_TEXTS[ast.status] || ast.status;
            
            const costFormatted = ast.purchaseCost 
                ? ast.purchaseCost.toLocaleString('vi-VN') + " đ" 
                : "Chưa cập nhật";
            
            const companyTag = ast.company 
                ? `<span style="font-size:10px; background:rgba(255,255,255,0.05); border:1px solid var(--border-glass); padding:2px 6px; border-radius:4px; color:var(--text-muted); font-weight:600; display:inline-block; margin-top:4px;">${ast.company}</span>` 
                : "";

            const assigneeInfo = ast.assignedTo 
                ? `<div class="assignee-name"><i class="fa-solid fa-user" style="font-size: 11px; margin-right:4px;"></i>${ast.assignedTo}</div>
                   <div class="asset-subtitle">${ast.department || ''}</div>`
                : `<span style="color: var(--text-muted); font-style: italic;">Chưa cấp phát</span>`;

            // Split location display based on Disposed status
            let locationCombined = "-";
            if (ast.status === "Disposed") {
                const dispDateFormatted = ast.disposalDate ? ast.disposalDate.split("-").reverse().join("/") : "-";
                locationCombined = `<div style="font-size:12px; color:var(--disposed-color); font-weight: 500;"><i class="fa-regular fa-calendar-times" style="margin-right:4px;"></i>Thanh lý: ${dispDateFormatted}</div>`;
            } else {
                const storageLocText = ast.storageLocation ? `Kho: ${ast.storageLocation}` : "-";
                const usageLocText = ast.usageLocation ? `Sử dụng: ${ast.usageLocation}` : "";
                
                locationCombined = usageLocText 
                    ? `<div style="font-size:13px; font-weight: 500;">${storageLocText}</div><div style="font-size:12px; color:var(--accent-light); margin-top:3px;"><i class="fa-solid fa-location-dot" style="font-size:10px; margin-right:4px;"></i>${usageLocText}</div>`
                    : `<div style="font-size:13px; font-weight: 500;">${storageLocText}</div>`;
            }

            let allocationBtn = "";
            if (ast.status === "Available") {
                allocationBtn = `
                    <button class="btn-icon assign" title="Cấp phát thiết bị" onclick="openAssignModal('${ast.id}')">
                        <i class="fa-solid fa-user-plus"></i>
                    </button>
                `;
            } else if (ast.status === "Active") {
                allocationBtn = `
                    <button class="btn-icon transfer" title="Điều chuyển người dùng" onclick="openTransferModal('${ast.id}')">
                        <i class="fa-solid fa-shuffle"></i>
                    </button>
                    <button class="btn-icon return" title="Thu hồi về kho" onclick="openReturnModal('${ast.id}')">
                        <i class="fa-solid fa-box-open"></i>
                    </button>
                `;
            }

            html += `
                <tr id="row-asset-${ast.id}">
                    <td><span class="asset-code" style="cursor: pointer;" onclick="openDetailsModal('${ast.id}')" title="Nhấp để xem nhanh chi tiết & lịch sử">${ast.id}</span></td>
                    <td>
                        <div class="asset-title" style="font-weight: 600;">${ast.name}</div>
                        <div>${companyTag}</div>
                        <div class="asset-subtitle" style="margin-top: 4px;">Giá mua: ${costFormatted}</div>
                    </td>
                    <td><span style="font-weight: 500;">${ast.category}</span></td>
                    <td>
                        <div class="asset-title" style="font-size: 13px;">${ast.brand || '-'}</div>
                        <div class="asset-subtitle" style="font-family: monospace;">S/N: ${ast.serialNumber || 'N/A'}</div>
                    </td>
                    <td><span class="badge ${statusClass}">${statusText}</span></td>
                    <td>${assigneeInfo}</td>
                    <td>${locationCombined}</td>
                    <td class="cell-actions">
                        <button class="btn-icon detail" title="Xem chi tiết" onclick="openDetailsModal('${ast.id}')">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        ${allocationBtn}
                        <button class="btn-icon edit" title="Sửa thông tin" onclick="openAssetModal('${ast.id}')">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-icon delete" title="Xóa tài sản" onclick="deleteAssetConfirm('${ast.id}', '${ast.name}')">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        elements.tbodyAssets.innerHTML = html;
    }

    function filterAndRenderLogs() {
        const searchQuery = elements.inputSearchLogs.value.trim().toLowerCase();

        const filtered = state.logs.filter(log => {
            if (searchQuery === "") return true;
            return (
                (log.assetId && log.assetId.toLowerCase().includes(searchQuery)) ||
                (log.assetName && log.assetName.toLowerCase().includes(searchQuery)) ||
                (log.action && log.action.toLowerCase().includes(searchQuery)) ||
                (log.operator && log.operator.toLowerCase().includes(searchQuery)) ||
                (log.details && log.details.toLowerCase().includes(searchQuery))
            );
        });

        renderLogsTable(filtered);
    }

    function renderLogsTable(logsList) {
        if (logsList.length === 0) {
            elements.tbodyLogs.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center" style="padding: 40px; color: var(--text-muted);">
                        Không tìm thấy lịch sử nhật ký nào.
                    </td>
                </tr>
            `;
            return;
        }

        let html = "";
        logsList.forEach(log => {
            let actionClass = "available";
            if (log.action.includes("Cấp phát")) actionClass = "active";
            else if (log.action.includes("Thu hồi")) actionClass = "return";
            else if (log.action.includes("Điều chuyển")) actionClass = "return";
            else if (log.action.includes("bảo trì") || log.action.includes("Bảo trì")) actionClass = "maintenance";
            else if (log.action.includes("Thanh lý") || log.action.includes("Xóa")) actionClass = "disposed";

            const formattedTime = formatLogDate(log.timestamp);
            const assetLink = log.assetId !== "-"
                ? `<span class="asset-code" style="font-size: 12px; cursor:pointer;" onclick="viewAssetLogs('${log.assetId}')">${log.assetId}</span>`
                : `<span style="color: var(--text-muted); font-size: 12px;">-</span>`;

            html += `
                <tr>
                    <td style="color: var(--text-muted); font-size: 13px;">${formattedTime}</td>
                    <td><span class="badge ${actionClass}" style="padding: 4px 8px; font-size: 11px;">${log.action}</span></td>
                    <td>${assetLink}</td>
                    <td style="font-weight: 500;">${log.assetName}</td>
                    <td style="color: var(--text-muted); font-size: 13px;">
                        <i class="fa-solid fa-user-gear" style="font-size:11px; margin-right:4px;"></i>${log.operator}
                    </td>
                    <td style="font-size: 13px; color: var(--text-muted); line-height: 1.4;">${log.details}</td>
                </tr>
            `;
        });

        elements.tbodyLogs.innerHTML = html;
    }

    window.viewAssetLogs = (assetId) => {
        elements.inputSearchLogs.value = assetId;
        switchTab(null, "logs");
    };

    function renderCustomFieldsConfig() {
        if (state.customFields.length === 0) {
            elements.tbodyCustomFields.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center" style="padding: 30px; color: var(--text-muted);">
                        Chưa có trường tùy chỉnh nào được thiết lập.
                    </td>
                </tr>
            `;
            return;
        }

        let html = "";
        state.customFields.forEach(field => {
            const typeText = FIELD_TYPES[field.type] || field.type;
            
            html += `
                <tr>
                    <td><strong style="color: var(--text-main); font-weight:600;">${field.label}</strong></td>
                    <td><code style="color: var(--accent-light); font-family: monospace; background: rgba(0,0,0,0.15); padding: 2px 6px; border-radius: 4px;">${field.key}</code></td>
                    <td><span style="font-size: 13px;">${typeText}</span></td>
                    <td class="text-right">
                        <button class="btn-icon delete" title="Xóa trường này" onclick="deleteCustomFieldConfirm('${field.key}', '${field.label}')">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        elements.tbodyCustomFields.innerHTML = html;
    }

    function generateDynamicFormFields() {
        elements.dynamicCustomFieldsContainer.innerHTML = "";
        
        if (state.customFields.length === 0) {
            elements.titleCustomFieldsSection.style.display = "none";
            return;
        }

        elements.titleCustomFieldsSection.style.display = "block";

        state.customFields.forEach(field => {
            const formGroup = document.createElement("div");
            formGroup.className = "form-group col-6";

            const labelEl = document.createElement("label");
            labelEl.setAttribute("for", `custom-field-${field.key}`);
            labelEl.textContent = field.label;

            let inputHTML = "";

            if (field.type === "boolean") {
                inputHTML = `
                    <div class="form-group-checkbox">
                        <input type="checkbox" id="custom-field-${field.key}">
                        <span class="value" style="font-size:14px; font-weight:500; color: var(--text-main);">Kích hoạt</span>
                    </div>
                `;
            } else if (field.type === "number") {
                inputHTML = `<input type="number" id="custom-field-${field.key}" placeholder="Nhập số..." step="any">`;
            } else if (field.type === "date") {
                inputHTML = `<input type="date" id="custom-field-${field.key}">`;
            } else {
                inputHTML = `<input type="text" id="custom-field-${field.key}" placeholder="Nhập ${field.label.toLowerCase()}...">`;
            }

            formGroup.appendChild(labelEl);
            
            const inputContainer = document.createElement("div");
            inputContainer.innerHTML = inputHTML;
            formGroup.appendChild(inputContainer.firstElementChild);

            elements.dynamicCustomFieldsContainer.appendChild(formGroup);
        });
    }

    // Open Add / Edit Asset Modal
    window.openAssetModal = (assetId = null) => {
        state.editingAssetId = assetId;
        
        generateDynamicFormFields();
        
        elements.formAsset.reset();
        elements.assetId.disabled = false;
        
        if (assetId) {
            elements.modalAssetTitle.textContent = "Chỉnh sửa thông tin tài sản IT";
            const ast = state.assets.find(a => a.id === assetId);
            if (ast) {
                elements.assetId.value = ast.id;
                elements.assetId.disabled = true;
                elements.assetName.value = ast.name || "";
                elements.assetCategory.value = ast.category || "";
                elements.assetCompany.value = ast.company || "SeaCorp";
                elements.assetBrand.value = ast.brand || "";
                elements.assetModel.value = ast.model || "";
                elements.assetSerial.value = ast.serialNumber || "";
                elements.assetStatus.value = ast.status || "Available";
                elements.assetPurchaseDate.value = ast.purchaseDate || "";
                elements.assetPurchaseCost.value = ast.purchaseCost || "";
                elements.assetStorageLocation.value = ast.storageLocation || "";
                elements.assetUsageLocation.value = ast.usageLocation || "";
                elements.assetAssignedTo.value = ast.assignedTo || "";
                elements.assetDepartment.value = ast.department || "";
                elements.assetNotes.value = ast.notes || "";
                
                elements.assetDisposalDate.value = ast.disposalDate || "";
                elements.assetMaintenanceReason.value = ast.maintenanceReason || "";

                // Call toggle inputs dynamically
                toggleStatusFields(ast.status);

                // Populate Custom Fields values
                if (ast.customFields) {
                    state.customFields.forEach(field => {
                        const inputEl = document.getElementById(`custom-field-${field.key}`);
                        if (inputEl) {
                            const val = ast.customFields[field.key];
                            if (field.type === "boolean") {
                                inputEl.checked = !!val;
                            } else {
                                inputEl.value = (val !== undefined && val !== null) ? val : "";
                            }
                        }
                    });
                }
            }
        } else {
            elements.modalAssetTitle.textContent = "Thêm tài sản IT mới";
            elements.assetStatus.value = "Available";
            elements.assetCompany.value = "SeaCorp";
            elements.assetStorageLocation.value = "Kho IT";
            elements.assetUsageLocation.value = "";
            elements.assetDisposalDate.value = "";
            elements.assetMaintenanceReason.value = "";
            toggleStatusFields("Available");
        }
        
        openModal(elements.modalAsset);
    };

    function closeAssetModal() {
        closeModal(elements.modalAsset);
        state.editingAssetId = null;
    }

    // View Details Modal open
    window.openDetailsModal = (assetId) => {
        const ast = state.assets.find(a => a.id === assetId);
        if (!ast) return;

        elements.detailDisplayId.textContent = ast.id;
        elements.detailDisplayName.textContent = ast.name;
        
        const statusClass = ast.status ? ast.status.toLowerCase() : "available";
        elements.detailDisplayStatus.className = `badge ${statusClass}`;
        elements.detailDisplayStatus.textContent = STATUS_TEXTS[ast.status] || ast.status;

        elements.detailValCategory.textContent = ast.category || "-";
        elements.detailValCompany.textContent = ast.company || "SeaCorp";
        elements.detailValBrand.textContent = ast.brand || "-";
        elements.detailValModel.textContent = ast.model || "-";
        elements.detailValSerial.textContent = ast.serialNumber || "-";
        elements.detailValPurchaseDate.textContent = ast.purchaseDate ? ast.purchaseDate.split("-").reverse().join("/") : "-";
        
        elements.detailValPurchaseCost.textContent = ast.purchaseCost 
            ? ast.purchaseCost.toLocaleString('vi-VN') + " đ" 
            : "Chưa cập nhật";
        
        elements.detailValAssignedTo.textContent = ast.assignedTo || "Chưa cấp phát";
        elements.detailValDepartment.textContent = ast.department || "-";
        elements.detailValNotes.textContent = ast.notes || "Không có ghi chú nào khác cho tài sản này.";

        // Toggle details section depending on Status
        if (ast.status === "Disposed") {
            elements.detailWrapperStorageLocation.style.display = "none";
            elements.detailWrapperUsageLocation.style.display = "none";
            elements.detailWrapperDisposalDate.style.display = "block";
            elements.detailWrapperMaintenanceReason.style.display = "none";
            
            elements.detailValDisposalDate.textContent = ast.disposalDate ? ast.disposalDate.split("-").reverse().join("/") : "-";
        } else if (ast.status === "Maintenance") {
            elements.detailWrapperStorageLocation.style.display = "block";
            elements.detailWrapperUsageLocation.style.display = "block";
            elements.detailWrapperDisposalDate.style.display = "none";
            elements.detailWrapperMaintenanceReason.style.display = "block";
            
            elements.detailValStorageLocation.textContent = ast.storageLocation || "-";
            elements.detailValUsageLocation.textContent = ast.usageLocation || "Chưa sử dụng (Trong kho)";
            elements.detailValMaintenanceReason.textContent = ast.maintenanceReason || "-";
        } else {
            // Available or Active
            elements.detailWrapperStorageLocation.style.display = "block";
            elements.detailWrapperUsageLocation.style.display = ast.usageLocation ? "block" : "none";
            elements.detailWrapperDisposalDate.style.display = "none";
            elements.detailWrapperMaintenanceReason.style.display = "none";
            
            elements.detailValStorageLocation.textContent = ast.storageLocation || "-";
            elements.detailValUsageLocation.textContent = ast.usageLocation || "Chưa sử dụng (Trong kho)";
        }

        // Custom Fields
        elements.detailCustomFieldsGrid.innerHTML = "";
        if (state.customFields.length > 0) {
            elements.detailCustomFieldsTitle.style.display = "block";
            elements.detailCustomFieldsGrid.style.display = "grid";
            
            let customFieldsHTML = "";
            state.customFields.forEach(field => {
                const val = (ast.customFields && ast.customFields[field.key] !== undefined) 
                    ? ast.customFields[field.key] 
                    : null;
                
                let displayVal = "-";
                if (val !== null && val !== "") {
                    if (field.type === "boolean") {
                        displayVal = val ? "Đúng (Có)" : "Sai (Không)";
                    } else if (field.type === "number") {
                        displayVal = val.toLocaleString('vi-VN');
                    } else {
                        displayVal = val;
                    }
                }

                customFieldsHTML += `
                    <div class="detail-item">
                        <span class="label">${field.label}</span>
                        <span class="value">${displayVal}</span>
                    </div>
                `;
            });
            elements.detailCustomFieldsGrid.innerHTML = customFieldsHTML;
        } else {
            elements.detailCustomFieldsTitle.style.display = "none";
            elements.detailCustomFieldsGrid.style.display = "none";
        }

        // Generate dynamic QR Code for Asset Tag lookup (offline Zalo/Camera friendly)
        const qrDataText = `[IT ASSET TAG]
Mã: ${ast.id}
Tên: ${ast.name}
Công ty: ${ast.company || "SeaCorp"}
Trạng thái: ${STATUS_TEXTS[ast.status] || ast.status}
Sở hữu: ${ast.assignedTo || "Trong kho"}
${ast.status === 'Disposed' ? `Ngày TL: ${ast.disposalDate}` : `Vị trí kho: ${ast.storageLocation || '-'}`}${ast.usageLocation ? `\nSử dụng tại: ${ast.usageLocation}` : ""}${ast.maintenanceReason ? `\nLý do bảo trì: ${ast.maintenanceReason}` : ""}`;

        const encodedQrData = encodeURIComponent(qrDataText);
        elements.detailQrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodedQrData}`;

        // Render asset activity logs timeline
        const assetLogs = state.logs.filter(log => log.assetId === ast.id);
        if (assetLogs.length === 0) {
            elements.detailAssetHistoryTimeline.innerHTML = `
                <p style="color: var(--text-muted); font-size: 13px; font-style: italic; padding: 15px 0 5px 0;">
                    Chưa ghi nhận lịch sử hoạt động nào cho tài sản này.
                </p>
            `;
        } else {
            let logsHtml = "";
            assetLogs.forEach(log => {
                let actionClass = "add";
                if (log.action.includes("Cấp phát")) actionClass = "assign";
                else if (log.action.includes("Thu hồi")) actionClass = "return";
                else if (log.action.includes("Điều chuyển")) actionClass = "return";
                else if (log.action.includes("bảo trì") || log.action.includes("Bảo trì")) actionClass = "maintenance";
                else if (log.action.includes("Thanh lý") || log.action.includes("Xóa")) actionClass = "dispose";

                const formattedTime = formatLogDate(log.timestamp);
                logsHtml += `
                    <div class="timeline-item ${actionClass}" style="padding-bottom: 12px; margin-left: 10px;">
                        <div class="timeline-marker" style="width: 8px; height: 8px; left: -4px; top: 6px;"></div>
                        <div class="timeline-content" style="padding: 0 0 0 15px;">
                            <div class="timeline-header" style="margin-bottom: 2px;">
                                <span class="timeline-title" style="font-size: 13px; font-weight: 600;">${log.action}</span>
                                <span class="timeline-time" style="font-size: 11px;">${formattedTime}</span>
                            </div>
                            <div class="timeline-desc" style="font-size: 12.5px; color: var(--text-muted); line-height: 1.4;">
                                ${log.details}
                                <span style="display:block; font-size: 10px; color: var(--accent); margin-top:3px; font-weight: 500;">Người thực hiện: ${log.operator}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            elements.detailAssetHistoryTimeline.innerHTML = logsHtml;
        }

        openModal(elements.modalDetails);
    };

    function closeDetailsModal() {
        closeModal(elements.modalDetails);
    }

    // Modal - Transfer open
    window.openTransferModal = (assetId) => {
        const ast = state.assets.find(a => a.id === assetId);
        if (!ast) return;

        elements.transferAssetId.value = ast.id;
        elements.transferAssetDisplayId.textContent = ast.id;
        elements.transferAssetDisplayName.textContent = ast.name;
        elements.transferAssetDisplayOldUser.textContent = `${ast.assignedTo} (${ast.department || 'Không có phòng ban'})`;
        elements.transferAssetDisplayCompany.textContent = ast.company || "SeaCorp";
        
        elements.transferToEmployee.value = "";
        elements.transferDepartment.value = "";
        elements.transferUsageLocation.value = ast.usageLocation || "Bàn làm việc nhân viên";
        elements.transferOperator.value = "Admin IT";

        openModal(elements.modalTransfer);
    };

    function closeTransferModal() {
        closeModal(elements.modalTransfer);
    }

    // Submit asset creation or update
    async function handleAssetFormSubmit(e) {
        e.preventDefault();
        
        const payload = {
            id: elements.assetId.value.trim(),
            name: elements.assetName.value.trim(),
            category: elements.assetCategory.value,
            company: elements.assetCompany.value,
            brand: elements.assetBrand.value.trim(),
            model: elements.assetModel.value.trim(),
            serialNumber: elements.assetSerial.value.trim(),
            status: elements.assetStatus.value,
            purchaseDate: elements.assetPurchaseDate.value,
            purchaseCost: parseFloat(elements.assetPurchaseCost.value) || 0,
            storageLocation: elements.assetStorageLocation.value.trim(),
            usageLocation: elements.assetUsageLocation.value.trim(),
            assignedTo: elements.assetAssignedTo.value.trim(),
            department: elements.assetDepartment.value.trim(),
            disposalDate: elements.assetDisposalDate.value,
            maintenanceReason: elements.assetMaintenanceReason.value.trim(),
            notes: elements.assetNotes.value.trim(),
            customFields: {}
        };

        // UI Validation client-side
        if (payload.status === "Maintenance" && !payload.maintenanceReason) {
            showToast("Thiếu thông tin", "Lý do bảo trì là bắt buộc khi chọn trạng thái bảo trì.", "error");
            return;
        }
        if (payload.status === "Disposed" && !payload.disposalDate) {
            showToast("Thiếu thông tin", "Ngày thanh lý là bắt buộc khi chọn trạng thái thanh lý.", "error");
            return;
        }
        if (payload.status !== "Disposed" && !payload.storageLocation) {
            showToast("Thiếu thông tin", "Vị trí kho lưu trữ là bắt buộc.", "error");
            return;
        }

        // Clean properties depending on status
        if (payload.status !== "Maintenance") payload.maintenanceReason = "";
        if (payload.status !== "Disposed") payload.disposalDate = "";

        state.customFields.forEach(field => {
            const inputEl = document.getElementById(`custom-field-${field.key}`);
            if (inputEl) {
                if (field.type === "boolean") {
                    payload.customFields[field.key] = inputEl.checked;
                } else if (field.type === "number") {
                    payload.customFields[field.key] = inputEl.value !== "" ? parseFloat(inputEl.value) : "";
                } else {
                    payload.customFields[field.key] = inputEl.value.trim();
                }
            }
        });

        const isEdit = state.editingAssetId !== null;

        if (useLocalStorage) {
            try {
                let assetsList = JSON.parse(localStorage.getItem("it_assets") || "[]");
                
                if (isEdit) {
                    const idx = assetsList.findIndex(a => a.id === state.editingAssetId);
                    if (idx === -1) throw new Error("Không tìm thấy tài sản.");
                    
                    const old = assetsList[idx];
                    let changes = [];
                    if (old.status !== payload.status) changes.push(`Trạng thái: ${old.status} -> ${payload.status}`);
                    if (old.assignedTo !== payload.assignedTo) changes.push(`Người sở hữu: ${old.assignedTo || 'không có'} -> ${payload.assignedTo || 'không có'}`);
                    if (old.company !== payload.company) changes.push(`Công ty: ${old.company} -> ${payload.company}`);
                    if (old.storageLocation !== payload.storageLocation) changes.push(`Vị trí kho: ${old.storageLocation} -> ${payload.storageLocation}`);
                    if (old.usageLocation !== payload.usageLocation) changes.push(`Vị trí sử dụng: ${old.usageLocation} -> ${payload.usageLocation}`);
                    if (payload.status === "Maintenance" && old.maintenanceReason !== payload.maintenanceReason) changes.push(`Lý do bảo trì: ${payload.maintenanceReason}`);
                    if (payload.status === "Disposed" && old.disposalDate !== payload.disposalDate) changes.push(`Ngày thanh lý: ${payload.disposalDate}`);

                    const details = changes.length > 0 ? "Thay đổi: " + changes.join(", ") : "Cập nhật chi tiết tài sản.";
                    
                    assetsList[idx] = payload;
                    writeLocalStorageLog("Cập nhật thông tin", payload.id, payload.name, "Admin IT", details);
                } else {
                    if (!payload.id) {
                        let maxNum = 0;
                        assetsList.forEach(a => {
                            if (a.id.startsWith("AST-")) {
                                const num = parseInt(a.id.replace("AST-", ""));
                                if (!isNaN(num) && num > maxNum) maxNum = num;
                            }
                        });
                        payload.id = `AST-${String(maxNum + 1).padStart(4, '0')}`;
                    } else {
                        if (assetsList.some(a => a.id.toLowerCase() === payload.id.toLowerCase())) {
                            throw new Error(`Mã tài sản '${payload.id}' đã tồn tại.`);
                        }
                    }
                    
                    if (!payload.status) payload.status = payload.assignedTo ? "Active" : "Available";
                    if (payload.status !== "Disposed" && !payload.storageLocation) payload.storageLocation = "Kho IT";
                    
                    assetsList.push(payload);
                    
                    let logDetail = `Thêm tài sản mới thuộc ${payload.company}: ${payload.name} (${payload.brand} - ${payload.model})`;
                    if (payload.status === "Maintenance") logDetail += `. Lý do bảo trì: ${payload.maintenanceReason}`;
                    else if (payload.status === "Disposed") logDetail += `. Ngày thanh lý: ${payload.disposalDate}`;
                    writeLocalStorageLog("Thêm tài sản", payload.id, payload.name, "Admin IT", logDetail);
                }
                
                localStorage.setItem("it_assets", JSON.stringify(assetsList));
                
                showToast(
                    isEdit ? "Cập nhật thành công" : "Thêm mới thành công",
                    `Tài sản ${payload.id} - ${payload.name} đã được lưu offline.`,
                    "success"
                );
                closeAssetModal();
                refreshAllData();
            } catch (err) {
                showToast("Lỗi thao tác", err.message, "error");
            }
        } else {
            const url = isEdit ? `/api/assets/${state.editingAssetId}` : "/api/assets";
            const method = isEdit ? "PUT" : "POST";

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Lỗi lưu tài sản.");

                showToast(
                    isEdit ? "Cập nhật thành công" : "Thêm mới thành công",
                    `Tài sản ${data.id} - ${data.name} đã được lưu thành công.`,
                    "success"
                );

                closeAssetModal();
                refreshAllData();
            } catch (err) {
                showToast("Lỗi thao tác", err.message, "error");
            }
        }
    }

    // Confirm and delete asset
    window.deleteAssetConfirm = async (id, name) => {
        const confirmed = confirm(`Bạn có chắc chắn muốn xóa tài sản: ${id} - ${name}?\nHành động này không thể hoàn tác.`);
        if (!confirmed) return;

        if (useLocalStorage) {
            let assetsList = JSON.parse(localStorage.getItem("it_assets") || "[]");
            const idx = assetsList.findIndex(a => a.id === id);
            if (idx !== -1) {
                assetsList.splice(idx, 1);
                localStorage.setItem("it_assets", JSON.stringify(assetsList));
                writeLocalStorageLog("Xóa tài sản", id, name, "Admin IT", `Đã xóa tài sản '${name}' khỏi hệ thống (Offline).`);
                showToast("Đã xóa tài sản", `Tài sản ${id} đã được xóa thành công.`, "info");
                refreshAllData();
            } else {
                showToast("Lỗi xóa tài sản", "Không tìm thấy tài sản trong LocalStorage.", "error");
            }
        } else {
            try {
                const response = await fetch(`/api/assets/${id}`, { method: "DELETE" });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Lỗi xóa tài sản.");

                showToast("Đã xóa tài sản", `Tài sản ${id} đã được xóa thành công khỏi hệ thống.`, "info");
                refreshAllData();
            } catch (err) {
                showToast("Lỗi xóa tài sản", err.message, "error");
            }
        }
    };

    // Open Assign Asset Modal
    window.openAssignModal = (assetId) => {
        const ast = state.assets.find(a => a.id === assetId);
        if (!ast) return;

        elements.assignAssetId.value = ast.id;
        elements.assignAssetDisplayId.textContent = ast.id;
        elements.assignAssetDisplayName.textContent = ast.name;
        
        elements.assignToEmployee.value = "";
        elements.assignDepartment.value = "";
        elements.assignUsageLocation.value = "Bàn làm việc nhân viên";
        elements.assignOperator.value = "Admin IT";

        openModal(elements.modalAssign);
    };

    function closeAssignModal() {
        closeModal(elements.modalAssign);
    }

    async function handleAssignFormSubmit(e) {
        e.preventDefault();
        
        const id = elements.assignAssetId.value;
        const payload = {
            assignedTo: elements.assignToEmployee.value.trim(),
            department: elements.assignDepartment.value.trim(),
            usageLocation: elements.assignUsageLocation.value.trim(),
            operator: elements.assignOperator.value.trim()
        };

        if (useLocalStorage) {
            let assetsList = JSON.parse(localStorage.getItem("it_assets") || "[]");
            const idx = assetsList.findIndex(a => a.id === id);
            if (idx !== -1) {
                assetsList[idx].assignedTo = payload.assignedTo;
                assetsList[idx].department = payload.department;
                assetsList[idx].usageLocation = payload.usageLocation || "Bàn làm việc nhân viên";
                assetsList[idx].status = "Active";
                
                localStorage.setItem("it_assets", JSON.stringify(assetsList));
                writeLocalStorageLog("Cấp phát tài sản", id, assetsList[idx].name, payload.operator, 
                    `Đã gán cho ${payload.assignedTo} (${payload.department}), vị trí sử dụng: ${payload.usageLocation} (Offline)`);
                
                showToast("Cấp phát thành công", `Tài sản ${id} đã được gán bàn giao offline cho ${payload.assignedTo}.`, "success");
                closeAssignModal();
                refreshAllData();
            } else {
                showToast("Lỗi cấp phát", "Không tìm thấy tài sản.", "error");
            }
        } else {
            try {
                const response = await fetch(`/api/assets/${id}/assign`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Lỗi cấp phát tài sản.");

                showToast("Cấp phát thành công", `Tài sản ${id} đã được bàn giao cho ${data.assignedTo}.`, "success");
                closeAssignModal();
                refreshAllData();
            } catch (err) {
                showToast("Lỗi cấp phát", err.message, "error");
            }
        }
    }

    // Open Return Asset Modal
    window.openReturnModal = (assetId) => {
        const ast = state.assets.find(a => a.id === assetId);
        if (!ast) return;

        elements.returnAssetId.value = ast.id;
        elements.returnAssetDisplayId.textContent = ast.id;
        elements.returnAssetDisplayName.textContent = ast.name;
        
        elements.returnStorageLocation.value = ast.storageLocation || "Kho IT, Văn phòng HCM";
        elements.returnOperator.value = "Admin IT";

        openModal(elements.modalReturn);
    };

    function closeReturnModal() {
        closeModal(elements.modalReturn);
    }

    async function handleReturnFormSubmit(e) {
        e.preventDefault();

        const id = elements.returnAssetId.value;
        const payload = {
            storageLocation: elements.returnStorageLocation.value.trim(),
            operator: elements.returnOperator.value.trim()
        };

        if (useLocalStorage) {
            let assetsList = JSON.parse(localStorage.getItem("it_assets") || "[]");
            const idx = assetsList.findIndex(a => a.id === id);
            if (idx !== -1) {
                const oldRecipient = assetsList[idx].assignedTo;
                const oldDept = assetsList[idx].department;
                
                assetsList[idx].assignedTo = "";
                assetsList[idx].department = "";
                assetsList[idx].usageLocation = "";
                assetsList[idx].storageLocation = payload.storageLocation || "Kho IT";
                assetsList[idx].status = "Available";
                
                localStorage.setItem("it_assets", JSON.stringify(assetsList));
                writeLocalStorageLog("Thu hồi tài sản", id, assetsList[idx].name, payload.operator, 
                    `Đã thu hồi từ ${oldRecipient} (${oldDept}). Về vị trí kho: ${payload.storageLocation} (Offline)`);
                
                showToast("Thu hồi thành công", `Tài sản ${id} đã được thu hồi về kho offline thành công.`, "info");
                closeReturnModal();
                refreshAllData();
            } else {
                showToast("Lỗi thu hồi", "Không tìm thấy tài sản.", "error");
            }
        } else {
            try {
                const response = await fetch(`/api/assets/${id}/return`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Lỗi thu hồi tài sản.");

                showToast("Thu hồi thành công", `Tài sản ${id} đã được thu hồi và đưa về kho thành công.`, "info");
                closeReturnModal();
                refreshAllData();
            } catch (err) {
                showToast("Lỗi thu hồi", err.message, "error");
            }
        }
    }

    // Direct Asset Transfer submit handling
    async function handleTransferFormSubmit(e) {
        e.preventDefault();

        const id = elements.transferAssetId.value;
        const payload = {
            newAssignedTo: elements.transferToEmployee.value.trim(),
            newDepartment: elements.transferDepartment.value.trim(),
            newUsageLocation: elements.transferUsageLocation.value.trim(),
            operator: elements.transferOperator.value.trim()
        };

        if (useLocalStorage) {
            let assetsList = JSON.parse(localStorage.getItem("it_assets") || "[]");
            const idx = assetsList.findIndex(a => a.id === id);
            
            if (idx !== -1) {
                const ast = assetsList[idx];
                if (ast.status !== "Active") {
                    showToast("Lỗi điều chuyển", "Chỉ tài sản đang hoạt động mới có thể điều chuyển trực tiếp.", "error");
                    return;
                }

                const oldUser = ast.assignedTo;
                const oldDept = ast.department;

                // Update recipient and usage location
                ast.assignedTo = payload.newAssignedTo;
                ast.department = payload.newDepartment;
                ast.usageLocation = payload.newUsageLocation || "Bàn làm việc nhân viên";

                localStorage.setItem("it_assets", JSON.stringify(assetsList));
                writeLocalStorageLog("Điều chuyển tài sản", id, ast.name, payload.operator, 
                    `Điều chuyển từ ${oldUser} (${oldDept}) sang ${payload.newAssignedTo} (${payload.newDepartment}). Vị trí sử dụng mới: ${ast.usageLocation}. (Công ty sở hữu: ${ast.company}) (Offline)`);

                showToast("Điều chuyển thành công", `Đã điều chuyển tài sản offline sang ${payload.newAssignedTo}.`, "success");
                closeTransferModal();
                refreshAllData();
            } else {
                showToast("Lỗi điều chuyển", "Không tìm thấy tài sản cần chuyển.", "error");
            }
        } else {
            try {
                const response = await fetch(`/api/assets/${id}/transfer`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Lỗi điều chuyển tài sản.");

                showToast("Điều chuyển thành công", `Đã bàn giao và cập nhật người dùng mới: ${data.assignedTo}.`, "success");
                closeTransferModal();
                refreshAllData();
            } catch (err) {
                showToast("Lỗi điều chuyển", err.message, "error");
            }
        }
    }

    // Submit custom field creation form
    async function handleCreateFieldSubmit(e) {
        e.preventDefault();

        const payload = {
            label: elements.newFieldLabel.value.trim(),
            key: elements.newFieldKey.value.trim(),
            type: elements.newFieldType.value
        };

        if (useLocalStorage) {
            try {
                let fieldsList = JSON.parse(localStorage.getItem("it_custom_fields") || "[]");
                
                if (fieldsList.some(f => f.key === payload.key)) {
                    throw new Error(`Mã trường '${payload.key}' đã tồn tại.`);
                }

                fieldsList.push(payload);
                localStorage.setItem("it_custom_fields", JSON.stringify(fieldsList));
                
                writeLocalStorageLog("Thêm trường tùy chỉnh", "-", "Cấu hình trường", "Admin IT", 
                    `Đã thêm trường tùy chỉnh mới: ${payload.label} (${payload.type}) (Offline)`);

                showToast("Thành công", `Trường '${payload.label}' đã được tạo offline.`, "success");
                elements.formCreateField.reset();
                refreshAllData();
            } catch (err) {
                showToast("Lỗi cấu hình", err.message, "error");
            }
        } else {
            try {
                const response = await fetch("/api/fields", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Lỗi tạo trường.");

                showToast("Thành công", `Trường '${data.label}' đã được đăng ký thành công.`, "success");
                elements.formCreateField.reset();
                refreshAllData();
            } catch (err) {
                showToast("Lỗi cấu hình", err.message, "error");
            }
        }
    }

    // Delete custom field confirmation
    window.deleteCustomFieldConfirm = async (key, label) => {
        const confirmed = confirm(`Bạn có chắc chắn muốn xóa trường tùy chỉnh: '${label}'?\nMọi dữ liệu liên quan đến trường này trên TẤT CẢ tài sản sẽ bị xóa bỏ.`);
        if (!confirmed) return;

        if (useLocalStorage) {
            let fieldsList = JSON.parse(localStorage.getItem("it_custom_fields") || "[]");
            const idx = fieldsList.findIndex(f => f.key === key);
            
            if (idx !== -1) {
                fieldsList.splice(idx, 1);
                localStorage.setItem("it_custom_fields", JSON.stringify(fieldsList));

                // Clean values inside assets in LocalStorage
                let assetsList = JSON.parse(localStorage.getItem("it_assets") || "[]");
                assetsList.forEach((ast, index) => {
                    if (ast.customFields && ast.customFields[key] !== undefined) {
                        delete assetsList[index].customFields[key];
                    }
                });
                localStorage.setItem("it_assets", JSON.stringify(assetsList));

                writeLocalStorageLog("Xóa trường tùy chỉnh", "-", "Cấu hình trường", "Admin IT", 
                    `Đã xóa trường tùy chỉnh '${label}' khỏi hệ thống (Offline).`);

                showToast("Đã xóa", `Trường '${label}' đã được xóa khỏi hệ thống.`, "info");
                refreshAllData();
            } else {
                showToast("Lỗi xóa", "Không tìm thấy trường trong LocalStorage.", "error");
            }
        } else {
            try {
                const response = await fetch(`/api/fields/${key}`, { method: "DELETE" });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Lỗi xóa trường.");

                showToast("Đã xóa", `Trường '${label}' đã được xóa khỏi hệ thống.`, "info");
                refreshAllData();
            } catch (err) {
                showToast("Lỗi xóa", err.message, "error");
            }
        }
    };

    function openModal(modalEl) {
        modalEl.classList.add("open");
        document.body.style.overflow = "hidden";
    }

    function closeModal(modalEl) {
        modalEl.classList.remove("open");
        document.body.style.overflow = "";
    }

    // Toggle offline mode explicitly
    window.toggleOfflineMode = (forceOffline) => {
        useLocalStorage = forceOffline;
        if (useLocalStorage) initLocalStorage();
        refreshAllData();
        showToast("Thay đổi chế độ", `Đã chuyển sang chế độ ${useLocalStorage ? 'Offline (LocalStorage)' : 'Online (Go Backend)'}.`, "info");
    };

    function showToast(title, message, type = "success") {
        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        
        let iconClass = "fa-solid fa-circle-check";
        if (type === "error") iconClass = "fa-solid fa-circle-exclamation";
        else if (type === "info") iconClass = "fa-solid fa-circle-info";

        toast.innerHTML = `
            <i class="${iconClass}"></i>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-msg">${message}</div>
            </div>
        `;

        elements.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = "slideOut 0.3s cubic-bezier(0.36, -0.07, 0.57, 0.34) forwards";
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3700);
    }

    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }
});
