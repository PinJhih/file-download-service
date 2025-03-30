import os
from datetime import timedelta

from minio import Minio
from minio.error import S3Error
from dotenv import load_dotenv

from .logger import logger

load_dotenv(".env")
MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY")
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "file-download")


def format_size(size_in_bytes):
    units = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"]
    size = float(size_in_bytes)
    unit_index = 0

    while size >= 1024 and unit_index < len(units) - 1:
        size /= 1024
        unit_index += 1

    return f"{size:.2f} {units[unit_index]}"


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
            raise e
        except Exception as e:
            logger.exception(
                f"An unexpected error occurred while connecting to MinIO:\n{e}"
            )
            raise e

    def file_list(self):
        objects = self.minio_client.list_objects(MINIO_BUCKET, recursive=True)

        # extract name, upload time and size, and format the fields
        file_list = list(
            map(
                lambda obj: {
                    "name": obj.object_name,
                    "last_modify": obj.last_modified.strftime("%Y-%m-%d %H:%M:%S"),
                    "size": format_size(obj.size),
                },
                objects,
            )
        )
        return file_list

    def generate_download_url(self, object_name, expiry):
        url = self.minio_client.presigned_get_object(
            MINIO_BUCKET, object_name, expires=timedelta(seconds=expiry)
        )
        return url
