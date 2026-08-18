import sys
import time
import psycopg2
from pymongo import MongoClient
import redis
import socket

def test_postgres():
    print("Testing PostgreSQL connection...")
    try:
        conn = psycopg2.connect(
            dbname="wildlife_db",
            user="admin",
            password="supersecretpassword",
            host="localhost",
            port="5432"
        )
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        db_version = cursor.fetchone()
        print(f"PostgreSQL Connection Successful! Version: {db_version[0]}")
        cursor.execute("SELECT PostGIS_Version();")
        postgis_version = cursor.fetchone()
        print(f"PostGIS Version: {postgis_version[0]}")
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"PostgreSQL Connection Failed: {e}")
        return False

def test_mongodb():
    print("Testing MongoDB connection...")
    try:
        client = MongoClient(
            "mongodb://admin:supersecretpassword@localhost:27017/",
            serverSelectionTimeoutMS=2000
        )
        client.admin.command('ping')
        print("MongoDB Connection Successful!")
        client.close()
        return True
    except Exception as e:
        print(f"MongoDB Connection Failed: {e}")
        return False

def test_redis():
    print("Testing Redis connection...")
    try:
        r = redis.Redis(host='localhost', port=6379, socket_connect_timeout=2)
        r.ping()
        print("Redis Connection Successful!")
        return True
    except Exception as e:
        print(f"Redis Connection Failed: {e}")
        return False

def test_rabbitmq():
    print("Testing RabbitMQ port connection...")
    try:
        s = socket.create_connection(("localhost", 5672), timeout=2)
        print("RabbitMQ (Port 5672) is reachable!")
        s.close()
        return True
    except Exception as e:
        print(f"RabbitMQ Connection Failed: {e}")
        return False

def main():
    # Wait a few seconds for services to fully initialize
    time.sleep(3)
    success = True
    success &= test_postgres()
    success &= test_mongodb()
    success &= test_redis()
    success &= test_rabbitmq()
    
    if success:
        print("All connections verified successfully.")
        sys.exit(0)
    else:
        print("Some connections failed verification.")
        sys.exit(1)

if __name__ == "__main__":
    main()
