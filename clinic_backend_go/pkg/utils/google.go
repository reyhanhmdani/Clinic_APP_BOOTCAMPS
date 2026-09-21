package utils

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// GooglePayload menampung profil pengguna yang dikembalikan Google API
type GooglePayload struct {
	Email         string `json:"email"`
	Name          string `json:"name"`
	Sub           string `json:"sub"`            // Google Unique ID
	EmailVerified any    `json:"email_verified"` // bisa bernilai boolean (userinfo) atau string "true" (tokeninfo)
}

// VerifyGoogleToken memvalidasi credential Google (bisa ID Token JWT atau OAuth Access Token)
func VerifyGoogleToken(credential string) (*GooglePayload, error) {
	credential = strings.TrimSpace(credential)
	if credential == "" {
		return nil, errors.New("Google token wajib disertakan")
	}

	client := &http.Client{Timeout: 10 * time.Second}
	var req *http.Request
	var err error

	// Cek apakah credential adalah ID Token (JWT dengan 3 bagian dipisah titik) atau Access Token
	isIDToken := strings.Count(credential, ".") == 2

	if isIDToken {
		reqURL := fmt.Sprintf("https://oauth2.googleapis.com/tokeninfo?id_token=%s", credential)
		req, err = http.NewRequest("GET", reqURL, nil)
	} else {
		reqURL := "https://www.googleapis.com/oauth2/v3/userinfo"
		req, err = http.NewRequest("GET", reqURL, nil)
		if err == nil {
			req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", credential))
		}
	}

	if err != nil {
		return nil, fmt.Errorf("gagal membuat request verifikasi Google: %w", err)
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("gagal menghubungi server Google: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("Token Google tidak valid atau sudah kedaluwarsa")
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, errors.New("gagal membaca respons dari Google")
	}

	var payload GooglePayload
	if err := json.Unmarshal(body, &payload); err != nil {
		return nil, errors.New("format profil Google tidak dikenali")
	}

	if payload.Email == "" {
		return nil, errors.New("Data profil Google tidak memiliki email yang valid")
	}

	// Validasi status verifikasi email Google jika ada
	if verified, ok := payload.EmailVerified.(bool); ok && !verified {
		return nil, errors.New("Email Google Anda belum terverifikasi")
	}
	if verifiedStr, ok := payload.EmailVerified.(string); ok && verifiedStr == "false" {
		return nil, errors.New("Email Google Anda belum terverifikasi")
	}

	payload.Email = strings.ToLower(strings.TrimSpace(payload.Email))
	return &payload, nil
}
