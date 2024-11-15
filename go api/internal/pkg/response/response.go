package response

import (
	"fmt"
	"runtime"
	"strings"

	"github.com/gin-gonic/gin"
)

// APIResponse is the standard API response structure
type APIResponse struct {
	StatusCode int         `json:"statusCode"`
	Data      interface{} `json:"data"`
	Success   bool        `json:"success"`
	Errors    []APIError  `json:"errors,omitempty"`
	Stack     *string     `json:"stack,omitempty"` // Optional stack trace
}

// APIError represents a single error in the response
type APIError struct {
	Code    string `json:"code"`              // Error code (e.g., "VALIDATION_ERROR")
	Message string `json:"message"`           // User-friendly error message
	Field   string `json:"field,omitempty"`   // Optional field name for validation errors
	Value   string `json:"value,omitempty"`   // Optional invalid value
}

// ResponseHandler manages API responses
type ResponseHandler struct {
	debug bool // Enable/disable stack traces
}

// New creates a new ResponseHandler instance
func New(debug bool) *ResponseHandler {
	return &ResponseHandler{
		debug: debug,
	}
}

// getStackTrace returns the current stack trace as a string
func (h *ResponseHandler) getStackTrace() *string {
	if !h.debug {
		return nil
	}

	var buf [4096]byte
	n := runtime.Stack(buf[:], false)
	stackTrace := string(buf[:n])
	return &stackTrace
}

// Success sends a successful response
func (h *ResponseHandler) Success(c *gin.Context, statusCode int, data interface{}) {
	response := APIResponse{
		StatusCode: statusCode,
		Data:      data,
		Success:   true,
	}
	c.JSON(statusCode, response)
}

// Error sends an error response
func (h *ResponseHandler) Error(c *gin.Context, statusCode int, errors []APIError) {
	response := APIResponse{
		StatusCode: statusCode,
		Data:      nil,
		Success:   false,
		Errors:    errors,
		Stack:     h.getStackTrace(),
	}
	c.JSON(statusCode, response)
}

// ValidationError represents validation errors for multiple fields
func (h *ResponseHandler) ValidationError(c *gin.Context, validationErrors []APIError) {
	h.Error(c, 400, validationErrors)
}

// SingleError is a helper for creating a single error response
func (h *ResponseHandler) SingleError(c *gin.Context, statusCode int, code, message string) {
	h.Error(c, statusCode, []APIError{{
		Code:    code,
		Message: message,
	}})
}

// WithPagination sends a paginated response
type PaginationMeta struct {
	Total      int64 `json:"total"`
	Page       int   `json:"page"`
	PageSize   int   `json:"pageSize"`
	TotalPages int   `json:"totalPages"`
}

type PaginatedResponse struct {
	Items interface{}    `json:"items"`
	Meta  PaginationMeta `json:"meta"`
}

func (h *ResponseHandler) WithPagination(c *gin.Context, statusCode int, items interface{}, total int64, page, pageSize int) {
	totalPages := (int(total) + pageSize - 1) / pageSize

	paginatedData := PaginatedResponse{
		Items: items,
		Meta: PaginationMeta{
			Total:      total,
			Page:       page,
			PageSize:   pageSize,
			TotalPages: totalPages,
		},
	}

	h.Success(c, statusCode, paginatedData)
}