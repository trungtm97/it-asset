package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"
)

type Asset struct {
	ID                string                 `json:"id"`
	Name              string                 `json:"name"`
	Category          string                 `json:"category"`
	Brand             string                 `json:"brand"`
	Model             string                 `json:"model"`
	SerialNumber      string                 `json:"serialNumber"`
	PurchaseDate      string                 `json:"purchaseDate"`
	PurchaseCost      float64                `json:"purchaseCost"`
	Status            string                 `json:"status"` // Active, Available, Maintenance, Disposed
	AssignedTo        string                 `json:"assignedTo"`
	Department        string                 `json:"department"`
	Company           string                 `json:"company"`           // Buying/owning company
	StorageLocation   string                 `json:"storageLocation"`   // Storage location / Warehouse
	UsageLocation     string                 `json:"usageLocation"`     // Real-time location where the asset is used
	DisposalDate      string                 `json:"disposalDate"`      // Date of asset disposal/liquidation
	MaintenanceReason string                 `json:"maintenanceReason"` // Reason for maintenance (Required if Status == Maintenance)
	Notes             string                 `json:"notes"`
	CustomFields      map[string]interface{} `json:"customFields"` // Dynamic custom fields mapping
}

type CustomField struct {
	Key   string `json:"key"`
	Label string `json:"label"`
	Type  string `json:"type"` // text, number, date, boolean
}

type AuditLog struct {
	Timestamp string `json:"timestamp"`
	Action    string `json:"action"`
	AssetID   string `json:"assetId"`
	AssetName string `json:"assetName"`
	Operator  string `json:"operator"`
	Details   string `json:"details"`
}

type AssignRequest struct {
	AssignedTo    string `json:"assignedTo"`
	Department    string `json:"department"`
	UsageLocation string `json:"usageLocation"`
	Operator      string `json:"operator"`
}

type ReturnRequest struct {
	StorageLocation string `json:"storageLocation"`
	Operator        string `json:"operator"`
}

type TransferRequest struct {
	NewAssignedTo    string `json:"newAssignedTo"`
	NewDepartment    string `json:"newDepartment"`
	NewUsageLocation string `json:"newUsageLocation"`
	Operator         string `json:"operator"`
}

var (
	assets          []Asset
	logs            []AuditLog
	customFieldsDef []CustomField
	dbMutex         sync.RWMutex
	assetsPath      = filepath.Join("data", "assets.json")
	logsPath        = filepath.Join("data", "logs.json")
	fieldsPath      = filepath.Join("data", "fields.json")
	port            = "8000"
)

func main() {
	if envPort := os.Getenv("PORT"); envPort != "" {
		port = envPort
	}

	if err := os.MkdirAll("data", 0755); err != nil {
		log.Fatalf("Failed to create data directory: %v", err)
	}

	if err := loadData(); err != nil {
		log.Printf("Error loading data: %v. Starting with empty data.", err)
	}

	mux := http.NewServeMux()

	// API Handlers
	mux.HandleFunc("GET /api/assets", handleGetAssets)
	mux.HandleFunc("POST /api/assets", handleCreateAsset)
	mux.HandleFunc("PUT /api/assets/{id}", handleUpdateAsset)
	mux.HandleFunc("DELETE /api/assets/{id}", handleDeleteAsset)
	mux.HandleFunc("POST /api/assets/{id}/assign", handleAssignAsset)
	mux.HandleFunc("POST /api/assets/{id}/return", handleReturnAsset)
	mux.HandleFunc("POST /api/assets/{id}/transfer", handleTransferAsset)
	mux.HandleFunc("GET /api/logs", handleGetLogs)

	// Custom Fields API Handlers
	mux.HandleFunc("GET /api/fields", handleGetFields)
	mux.HandleFunc("POST /api/fields", handleCreateField)
	mux.HandleFunc("DELETE /api/fields/{key}", handleDeleteField)

	// Static Web UI serving
	mux.HandleFunc("GET /", handleStatic)

	// CORS wrapper
	handler := enableCORS(mux)

	log.Printf("IT Asset Management server starting on port %s...", port)
	log.Printf("Local URL: http://localhost:%s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

func loadData() error {
	dbMutex.Lock()
	defer dbMutex.Unlock()

	// Load assets
	if _, err := os.Stat(assetsPath); err == nil {
		data, err := os.ReadFile(assetsPath)
		if err != nil {
			return fmt.Errorf("read assets file error: %w", err)
		}
		if err := json.Unmarshal(data, &assets); err != nil {
			return fmt.Errorf("parse assets json error: %w", err)
		}
	} else {
		assets = []Asset{}
	}

	// Load logs
	if _, err := os.Stat(logsPath); err == nil {
		data, err := os.ReadFile(logsPath)
		if err != nil {
			return fmt.Errorf("read logs file error: %w", err)
		}
		if err := json.Unmarshal(data, &logs); err != nil {
			return fmt.Errorf("parse logs json error: %w", err)
		}
	} else {
		logs = []AuditLog{}
	}

	// Load custom fields definition
	if _, err := os.Stat(fieldsPath); err == nil {
		data, err := os.ReadFile(fieldsPath)
		if err != nil {
			return fmt.Errorf("read fields file error: %w", err)
		}
		if err := json.Unmarshal(data, &customFieldsDef); err != nil {
			return fmt.Errorf("parse fields json error: %w", err)
		}
	} else {
		customFieldsDef = []CustomField{
			{Key: "he_dieu_hanh", Label: "Hệ điều hành", Type: "text"},
			{Key: "ram_gb", Label: "Dung lượng RAM (GB)", Type: "number"},
			{Key: "dung_luong_o_cung", Label: "Dung lượng ổ cứng", Type: "text"},
		}
		fieldsData, _ := json.MarshalIndent(customFieldsDef, "", "  ")
		os.WriteFile(fieldsPath, fieldsData, 0644)
	}

	return nil
}

func saveData() error {
	assetsData, err := json.MarshalIndent(assets, "", "  ")
	if err != nil {
		return fmt.Errorf("serialize assets error: %w", err)
	}
	if err := os.WriteFile(assetsPath, assetsData, 0644); err != nil {
		return fmt.Errorf("write assets file error: %w", err)
	}

	logsData, err := json.MarshalIndent(logs, "", "  ")
	if err != nil {
		return fmt.Errorf("serialize logs error: %w", err)
	}
	if err := os.WriteFile(logsPath, logsData, 0644); err != nil {
		return fmt.Errorf("write logs file error: %w", err)
	}

	fieldsData, err := json.MarshalIndent(customFieldsDef, "", "  ")
	if err != nil {
		return fmt.Errorf("serialize fields error: %w", err)
	}
	if err := os.WriteFile(fieldsPath, fieldsData, 0644); err != nil {
		return fmt.Errorf("write fields file error: %w", err)
	}

	return nil
}

func writeLog(action, assetID, assetName, operator, details string) {
	newLog := AuditLog{
		Timestamp: time.Now().Format(time.RFC3339),
		Action:    action,
		AssetID:   assetID,
		AssetName: assetName,
		Operator:  operator,
		Details:   details,
	}
	logs = append([]AuditLog{newLog}, logs...)
}

func respondWithJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func respondWithError(w http.ResponseWriter, status int, message string) {
	respondWithJSON(w, status, map[string]string{"error": message})
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		w.Header().Set("X-Frame-Options", "SAMEORIGIN")
		w.Header().Set("Content-Security-Policy", "frame-ancestors 'self'")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func handleGetAssets(w http.ResponseWriter, r *http.Request) {
	dbMutex.RLock()
	defer dbMutex.RUnlock()

	search := strings.ToLower(r.URL.Query().Get("search"))
	category := r.URL.Query().Get("category")
	status := r.URL.Query().Get("status")

	filtered := []Asset{}

	for _, ast := range assets {
		if category != "" && ast.Category != category {
			continue
		}
		if status != "" && ast.Status != status {
			continue
		}
		if search != "" {
			match := strings.Contains(strings.ToLower(ast.ID), search) ||
				strings.Contains(strings.ToLower(ast.Name), search) ||
				strings.Contains(strings.ToLower(ast.Brand), search) ||
				strings.Contains(strings.ToLower(ast.Model), search) ||
				strings.Contains(strings.ToLower(ast.SerialNumber), search) ||
				strings.Contains(strings.ToLower(ast.AssignedTo), search) ||
				strings.Contains(strings.ToLower(ast.Department), search) ||
				strings.Contains(strings.ToLower(ast.Company), search) ||
				strings.Contains(strings.ToLower(ast.StorageLocation), search) ||
				strings.Contains(strings.ToLower(ast.UsageLocation), search) ||
				strings.Contains(strings.ToLower(ast.DisposalDate), search) ||
				strings.Contains(strings.ToLower(ast.MaintenanceReason), search)
			
			if !match && ast.CustomFields != nil {
				for _, val := range ast.CustomFields {
					if valStr, ok := val.(string); ok {
						if strings.Contains(strings.ToLower(valStr), search) {
							match = true
							break
						}
					}
				}
			}

			if !match {
				continue
			}
		}
		filtered = append(filtered, ast)
	}

	respondWithJSON(w, http.StatusOK, filtered)
}

func handleCreateAsset(w http.ResponseWriter, r *http.Request) {
	dbMutex.Lock()
	defer dbMutex.Unlock()

	var ast Asset
	if err := json.NewDecoder(r.Body).Decode(&ast); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if ast.Name == "" || ast.Category == "" {
		respondWithError(w, http.StatusBadRequest, "Name and Category are required fields")
		return
	}

	// Dynamic Validation logic
	if ast.Status == "Maintenance" && strings.TrimSpace(ast.MaintenanceReason) == "" {
		respondWithError(w, http.StatusBadRequest, "Lý do bảo trì là bắt buộc khi chọn trạng thái Đang bảo trì")
		return
	}
	if ast.Status == "Disposed" && strings.TrimSpace(ast.DisposalDate) == "" {
		respondWithError(w, http.StatusBadRequest, "Ngày thanh lý là bắt buộc khi chọn trạng thái Đã thanh lý")
		return
	}
	if ast.Status != "Disposed" && strings.TrimSpace(ast.StorageLocation) == "" {
		respondWithError(w, http.StatusBadRequest, "Vị trí kho lưu trữ là bắt buộc")
		return
	}

	// Clean fields
	if ast.Status != "Maintenance" {
		ast.MaintenanceReason = ""
	}
	if ast.Status != "Disposed" {
		ast.DisposalDate = ""
	}

	ast.ID = strings.TrimSpace(ast.ID)
	if ast.ID == "" {
		maxNum := 0
		for _, a := range assets {
			if strings.HasPrefix(a.ID, "AST-") {
				numStr := strings.TrimPrefix(a.ID, "AST-")
				if num, err := strconv.Atoi(numStr); err == nil && num > maxNum {
					maxNum = num
				}
			}
		}
		ast.ID = fmt.Sprintf("AST-%04d", maxNum+1)
	} else {
		for _, a := range assets {
			if strings.EqualFold(a.ID, ast.ID) {
				respondWithError(w, http.StatusBadRequest, fmt.Sprintf("Asset ID '%s' already exists", ast.ID))
				return
			}
		}
	}

	if ast.Status == "" {
		if ast.AssignedTo != "" {
			ast.Status = "Active"
		} else {
			ast.Status = "Available"
		}
	}

	if ast.Company == "" {
		ast.Company = "SeaCorp"
	}
	if ast.Status != "Disposed" && ast.StorageLocation == "" {
		ast.StorageLocation = "Kho IT"
	}

	if ast.CustomFields == nil {
		ast.CustomFields = make(map[string]interface{})
	}

	assets = append(assets, ast)
	
	logDetail := fmt.Sprintf("Thêm tài sản mới thuộc %s: %s (%s - %s)", ast.Company, ast.Name, ast.Brand, ast.Model)
	if ast.Status == "Maintenance" {
		logDetail += fmt.Sprintf(". Lý do bảo trì: %s", ast.MaintenanceReason)
	} else if ast.Status == "Disposed" {
		logDetail += fmt.Sprintf(". Ngày thanh lý: %s", ast.DisposalDate)
	}
	writeLog("Thêm tài sản", ast.ID, ast.Name, "Admin IT", logDetail)

	if err := saveData(); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to save data: "+err.Error())
		return
	}

	respondWithJSON(w, http.StatusCreated, ast)
}

func handleUpdateAsset(w http.ResponseWriter, r *http.Request) {
	dbMutex.Lock()
	defer dbMutex.Unlock()

	id := r.PathValue("id")
	if id == "" {
		respondWithError(w, http.StatusBadRequest, "Asset ID is required")
		return
	}

	var updated Asset
	if err := json.NewDecoder(r.Body).Decode(&updated); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// Dynamic Validation logic
	if updated.Status == "Maintenance" && strings.TrimSpace(updated.MaintenanceReason) == "" {
		respondWithError(w, http.StatusBadRequest, "Lý do bảo trì là bắt buộc khi chọn trạng thái Đang bảo trì")
		return
	}
	if updated.Status == "Disposed" && strings.TrimSpace(updated.DisposalDate) == "" {
		respondWithError(w, http.StatusBadRequest, "Ngày thanh lý là bắt buộc khi chọn trạng thái Đã thanh lý")
		return
	}
	if updated.Status != "Disposed" && strings.TrimSpace(updated.StorageLocation) == "" {
		respondWithError(w, http.StatusBadRequest, "Vị trí kho lưu trữ là bắt buộc")
		return
	}

	// Clean fields
	if updated.Status != "Maintenance" {
		updated.MaintenanceReason = ""
	}
	if updated.Status != "Disposed" {
		updated.DisposalDate = ""
	}

	index := -1
	for i, a := range assets {
		if a.ID == id {
			index = i
			break
		}
	}

	if index == -1 {
		respondWithError(w, http.StatusNotFound, "Asset not found")
		return
	}

	updated.ID = id
	oldAsset := assets[index]

	details := []string{}
	if oldAsset.Status != updated.Status {
		details = append(details, fmt.Sprintf("Trạng thái: %s -> %s", oldAsset.Status, updated.Status))
	}
	if oldAsset.AssignedTo != updated.AssignedTo {
		details = append(details, fmt.Sprintf("Người sở hữu: '%s' -> '%s'", oldAsset.AssignedTo, updated.AssignedTo))
	}
	if oldAsset.Company != updated.Company {
		details = append(details, fmt.Sprintf("Công ty: '%s' -> '%s'", oldAsset.Company, updated.Company))
	}
	if oldAsset.StorageLocation != updated.StorageLocation {
		details = append(details, fmt.Sprintf("Vị trí kho: '%s' -> '%s'", oldAsset.StorageLocation, updated.StorageLocation))
	}
	if oldAsset.UsageLocation != updated.UsageLocation {
		details = append(details, fmt.Sprintf("Vị trí sử dụng: '%s' -> '%s'", oldAsset.UsageLocation, updated.UsageLocation))
	}
	if updated.Status == "Maintenance" && oldAsset.MaintenanceReason != updated.MaintenanceReason {
		details = append(details, fmt.Sprintf("Lý do bảo trì: '%s'", updated.MaintenanceReason))
	}
	if updated.Status == "Disposed" && oldAsset.DisposalDate != updated.DisposalDate {
		details = append(details, fmt.Sprintf("Ngày thanh lý: '%s'", updated.DisposalDate))
	}

	var detailStr string
	if len(details) > 0 {
		detailStr = "Cập nhật thay đổi: " + strings.Join(details, ", ")
	} else {
		detailStr = "Cập nhật chi tiết thông tin tài sản."
	}

	if updated.CustomFields == nil {
		updated.CustomFields = make(map[string]interface{})
	}

	assets[index] = updated
	writeLog("Cập nhật thông tin", id, updated.Name, "Admin IT", detailStr)

	if err := saveData(); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to save data: "+err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, updated)
}

func handleDeleteAsset(w http.ResponseWriter, r *http.Request) {
	dbMutex.Lock()
	defer dbMutex.Unlock()

	id := r.PathValue("id")
	if id == "" {
		respondWithError(w, http.StatusBadRequest, "Asset ID is required")
		return
	}

	index := -1
	var ast Asset
	for i, a := range assets {
		if a.ID == id {
			index = i
			ast = a
			break
		}
	}

	if index == -1 {
		respondWithError(w, http.StatusNotFound, "Asset not found")
		return
	}

	assets = append(assets[:index], assets[index+1:]...)
	writeLog("Xóa tài sản", id, ast.Name, "Admin IT", fmt.Sprintf("Đã xóa tài sản '%s' khỏi hệ thống.", ast.Name))

	if err := saveData(); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to save data: "+err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]bool{"success": true})
}

func handleAssignAsset(w http.ResponseWriter, r *http.Request) {
	dbMutex.Lock()
	defer dbMutex.Unlock()

	id := r.PathValue("id")
	if id == "" {
		respondWithError(w, http.StatusBadRequest, "Asset ID is required")
		return
	}

	var req AssignRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if req.AssignedTo == "" {
		respondWithError(w, http.StatusBadRequest, "Recipient name (assignedTo) is required")
		return
	}

	index := -1
	for i, a := range assets {
		if a.ID == id {
			index = i
			break
		}
	}

	if index == -1 {
		respondWithError(w, http.StatusNotFound, "Asset not found")
		return
	}

	if req.Operator == "" {
		req.Operator = "Admin IT"
	}

	assets[index].AssignedTo = req.AssignedTo
	assets[index].Department = req.Department
	if req.UsageLocation != "" {
		assets[index].UsageLocation = req.UsageLocation
	} else {
		assets[index].UsageLocation = "Bàn làm việc nhân viên"
	}
	assets[index].Status = "Active"

	writeLog("Cấp phát tài sản", id, assets[index].Name, req.Operator,
		fmt.Sprintf("Đã gán cho %s (%s), vị trí sử dụng: %s (Kho chủ quản: %s)", req.AssignedTo, req.Department, assets[index].UsageLocation, assets[index].StorageLocation))

	if err := saveData(); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to save data: "+err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, assets[index])
}

func handleReturnAsset(w http.ResponseWriter, r *http.Request) {
	dbMutex.Lock()
	defer dbMutex.Unlock()

	id := r.PathValue("id")
	if id == "" {
		respondWithError(w, http.StatusBadRequest, "Asset ID is required")
		return
	}

	var req ReturnRequest
	if r.Body != nil {
		json.NewDecoder(r.Body).Decode(&req)
	}

	index := -1
	for i, a := range assets {
		if a.ID == id {
			index = i
			break
		}
	}

	if index == -1 {
		respondWithError(w, http.StatusNotFound, "Asset not found")
		return
	}

	if req.Operator == "" {
		req.Operator = "Admin IT"
	}
	if req.StorageLocation != "" {
		assets[index].StorageLocation = req.StorageLocation
	} else {
		assets[index].StorageLocation = "Kho IT"
	}

	oldRecipient := assets[index].AssignedTo
	oldDept := assets[index].Department

	assets[index].AssignedTo = ""
	assets[index].Department = ""
	assets[index].UsageLocation = ""
	assets[index].Status = "Available"

	writeLog("Thu hồi tài sản", id, assets[index].Name, req.Operator,
		fmt.Sprintf("Đã thu hồi từ %s (%s). Thiết bị đưa về vị trí kho lưu trữ: %s", oldRecipient, oldDept, assets[index].StorageLocation))

	if err := saveData(); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to save data: "+err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, assets[index])
}

func handleTransferAsset(w http.ResponseWriter, r *http.Request) {
	dbMutex.Lock()
	defer dbMutex.Unlock()

	id := r.PathValue("id")
	if id == "" {
		respondWithError(w, http.StatusBadRequest, "Asset ID is required")
		return
	}

	var req TransferRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if req.NewAssignedTo == "" {
		respondWithError(w, http.StatusBadRequest, "New recipient name (newAssignedTo) is required")
		return
	}

	index := -1
	for i, a := range assets {
		if a.ID == id {
			index = i
			break
		}
	}

	if index == -1 {
		respondWithError(w, http.StatusNotFound, "Asset not found")
		return
	}

	ast := &assets[index]
	if ast.Status != "Active" {
		respondWithError(w, http.StatusBadRequest, "Only active/allocated assets can be transferred directly")
		return
	}

	if req.Operator == "" {
		req.Operator = "Admin IT"
	}

	oldUser := ast.AssignedTo
	oldDept := ast.Department

	ast.AssignedTo = req.NewAssignedTo
	ast.Department = req.NewDepartment
	if req.NewUsageLocation != "" {
		ast.UsageLocation = req.NewUsageLocation
	} else {
		ast.UsageLocation = "Bàn làm việc nhân viên"
	}

	writeLog("Điều chuyển tài sản", id, ast.Name, req.Operator,
		fmt.Sprintf("Điều chuyển từ %s (%s) sang %s (%s). Vị trí sử dụng mới: %s. (Công ty sở hữu: %s)", oldUser, oldDept, ast.AssignedTo, ast.Department, ast.UsageLocation, ast.Company))

	if err := saveData(); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to save data: "+err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, *ast)
}

func handleGetLogs(w http.ResponseWriter, r *http.Request) {
	dbMutex.RLock()
	defer dbMutex.RUnlock()
	respondWithJSON(w, http.StatusOK, logs)
}

func handleGetFields(w http.ResponseWriter, r *http.Request) {
	dbMutex.RLock()
	defer dbMutex.RUnlock()
	respondWithJSON(w, http.StatusOK, customFieldsDef)
}

func handleCreateField(w http.ResponseWriter, r *http.Request) {
	dbMutex.Lock()
	defer dbMutex.Unlock()

	var newField CustomField
	if err := json.NewDecoder(r.Body).Decode(&newField); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	newField.Key = strings.TrimSpace(strings.ToLower(newField.Key))
	newField.Label = strings.TrimSpace(newField.Label)
	newField.Type = strings.TrimSpace(strings.ToLower(newField.Type))

	if newField.Key == "" || newField.Label == "" {
		respondWithError(w, http.StatusBadRequest, "Field Key and Label are required")
		return
	}

	for _, char := range newField.Key {
		if !((char >= 'a' && char <= 'z') || (char >= '0' && char <= '9') || char == '_') {
			respondWithError(w, http.StatusBadRequest, "Key must only contain lowercase English letters, numbers, and underscores")
			return
		}
	}

	for _, f := range customFieldsDef {
		if f.Key == newField.Key {
			respondWithError(w, http.StatusBadRequest, fmt.Sprintf("Field key '%s' already exists", newField.Key))
			return
		}
	}

	if newField.Type == "" {
		newField.Type = "text"
	}

	customFieldsDef = append(customFieldsDef, newField)

	writeLog("Thêm trường tùy chỉnh", "-", "Cấu hình trường", "Admin IT", fmt.Sprintf("Đã đăng ký trường tùy chỉnh mới: '%s' (%s)", newField.Label, newField.Type))

	if err := saveData(); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to save field configuration: "+err.Error())
		return
	}

	respondWithJSON(w, http.StatusCreated, newField)
}

func handleDeleteField(w http.ResponseWriter, r *http.Request) {
	dbMutex.Lock()
	defer dbMutex.Unlock()

	key := r.PathValue("key")
	if key == "" {
		respondWithError(w, http.StatusBadRequest, "Field key is required")
		return
	}

	index := -1
	var field CustomField
	for i, f := range customFieldsDef {
		if f.Key == key {
			index = i
			field = f
			break
		}
	}

	if index == -1 {
		respondWithError(w, http.StatusNotFound, "Field configuration not found")
		return
	}

	customFieldsDef = append(customFieldsDef[:index], customFieldsDef[index+1:]...)

	for i, ast := range assets {
		if ast.CustomFields != nil {
			if _, exists := ast.CustomFields[key]; exists {
				delete(assets[i].CustomFields, key)
			}
		}
	}

	writeLog("Xóa trường tùy chỉnh", "-", "Cấu hình trường", "Admin IT", fmt.Sprintf("Đã xóa trường tùy chỉnh '%s' khỏi hệ thống.", field.Label))

	if err := saveData(); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to save field configuration: "+err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]bool{"success": true})
}

func handleStatic(w http.ResponseWriter, r *http.Request) {
	path := filepath.Clean(r.URL.Path)

	if path == "/" || path == "" {
		http.ServeFile(w, r, filepath.Join("web-ui", "index.html"))
		return
	}

	filePath := filepath.Join("web-ui", path)
	info, err := os.Stat(filePath)
	if err == nil && !info.IsDir() {
		http.ServeFile(w, r, filePath)
		return
	}

	if !strings.HasPrefix(path, "/api/") {
		http.ServeFile(w, r, filepath.Join("web-ui", "index.html"))
		return
	}

	http.NotFound(w, r)
}
