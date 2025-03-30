import os

from minio import Minio
from minio.error import S3Error
from dotenv import load_dotenv

from .logger import logger

load_dotenv(".env")
MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY")
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "file-download")

class MinIOClient:
    def __init__(self):
        try:
            self.minio_client = Minio(
                MINIO_ENDPOINT,
                access_key=MINIO_ACCESS_KEY,
                secret_key=MINIO_SECRET_KEY,
                secure=False,
            )
            logger.info("Successfully connected to MinIO.")

            # ensure the bucket exists
            if not self.minio_client.bucket_exists(MINIO_BUCKET):
                self.minio_client.make_bucket(MINIO_BUCKET)
                logger.info(f"Created bucket: {MINIO_BUCKET}")

        except S3Error as e:
            logger.error(f"MinIO connection failed:\n{e}")
            exit(1)
        except Exception as e:
            logger.exception(
                f"An unexpected error occurred while connecting to MinIO:\n{e}"
            )
            exit(1)
