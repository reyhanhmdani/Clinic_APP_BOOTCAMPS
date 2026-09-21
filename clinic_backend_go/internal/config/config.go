package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	DatabaseUrl string
	JWTSecret   string
}

func LoadConfig() *Config {
	// load env jika ada
	if err := godotenv.Load(); err != nil {
		log.Println("Peringatan: File .env tidak di temukan, membaca environment")
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	dbUrl := os.Getenv("DATABASE_URL")
	if dbUrl == "" {
		log.Fatal("FATAL: DATABASE_URL tidak ditemukan di environment!")
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "default_secret_key"
	}

	return &Config{
		Port:        port,
		DatabaseUrl: dbUrl,
		JWTSecret:   jwtSecret,
	}
}
