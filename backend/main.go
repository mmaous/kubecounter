package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

type Counter struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Value int    `json:"value"`
}

func main() {
	godotenv.Load() // Load .env file locally

	serverPort := os.Getenv("SERVER_PORT")

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

	r := gin.Default()

	// Enable CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"*"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		AllowCredentials: true,
	}))

	// POST /counter
	r.POST("/counter", func(c *gin.Context) {
		var counter Counter
		if err := c.ShouldBindJSON(&counter); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		_, err := db.Exec("INSERT INTO counters (name, value) VALUES ($1, $2)", counter.Name, counter.Value)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "saved"})
	})

	// GET /counters
	r.GET("/counters", func(c *gin.Context) {
		rows, err := db.Query("SELECT id, name, value FROM counters ORDER BY id")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var counters []Counter
		for rows.Next() {
			var counter Counter
			if err := rows.Scan(&counter.ID, &counter.Name, &counter.Value); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			counters = append(counters, counter)
		}
		c.JSON(http.StatusOK, counters)
	})

	// GET /counter/:id
	r.GET("/counter/:id", func(c *gin.Context) {
		idParam := c.Param("id")
		id, err := strconv.Atoi(idParam)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
			return
		}

		var counter Counter
		err = db.QueryRow("SELECT id, name, value FROM counters WHERE id = $1", id).Scan(&counter.ID, &counter.Name, &counter.Value)
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Counter not found"})
			return
		} else if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, counter)
	})
	r.PUT("/counter/:id", func(c *gin.Context) {
		id := c.Param("id")

		var counter Counter
		if err := c.ShouldBindJSON(&counter); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		query := `UPDATE counters SET name=$1, value=$2 WHERE id=$3`
		res, err := db.Exec(query, counter.Name, counter.Value, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		rowsAffected, err := res.RowsAffected()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "counter not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"status": "updated"})
	})

	// Delete counter
	r.DELETE("/counter/:id", func(c *gin.Context) {
		id := c.Param("id")
		_, err := db.Exec("DELETE FROM counters WHERE id = $1", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "deleted"})
	})

	r.Run(":" + serverPort)
}
