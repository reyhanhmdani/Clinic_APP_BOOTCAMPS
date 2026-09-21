package utils

import "github.com/gin-gonic/gin"

func SuccessResponse(c *gin.Context, statusCode int, message string, data any) {
	res := gin.H{
		"status":  true,
		"success": true,
		"data":    data,
	}
	if message != "" {
		res["message"] = message
	}
	c.JSON(statusCode, res)
}

func ErrorResponse(c *gin.Context, statusCode int, message string, errDetail ...any) {
	res := gin.H{
		"status":  false,
		"success": false,
		"message": message,
	}
	if len(errDetail) > 0 && errDetail[0] != nil {
		res["error"] = errDetail[0]
	}
	c.JSON(statusCode, res)
}
