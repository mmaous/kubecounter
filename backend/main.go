package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

type Counter struct {
	Name  string `json:"name"`
	Value int    `json:"value"`
}

func main() {
	godotenv.Load() // Load .env file locally

	serverPort := os.Getenv("SERVER_PORT")

	/*
		dbHost := os.Getenv("DB_HOST")
		dbPort := os.Getenv("DB_PORT")
		dbUser := os.Getenv("DB_USER")
		dbPassword := os.Getenv("DB_PASSWORD")
		dbName := os.Getenv("DB_NAME")

		connStr := "host=" + dbHost + " port=" + dbPort +
			" user=" + dbUser + " password=" + dbPassword +
			" dbname=" + dbName + " sslmode=disable"

		db, err := sql.Open("postgres", connStr)
		if err != nil {
			log.Fatal(err)
		}
		defer db.Close()
	*/
	r := gin.Default()
	// Add this CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		AllowCredentials: true,
	}))
	r.POST("/counter", func(c *gin.Context) {
		var counter Counter
		if err := c.ShouldBindJSON(&counter); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		fmt.Println("INSERT INTO counters (name, value) VALUES ($1, $2)", counter.Name, counter.Value)

		/*_, err := db.Exec("INSERT INTO counters (name, value) VALUES ($1, $2)", counter.Name, counter.Value)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		*/
		c.JSON(http.StatusOK, gin.H{"status": "saved"})
	})

	r.Run(":" + serverPort)
}
