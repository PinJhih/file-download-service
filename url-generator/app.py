from flask import Flask

from url_generator.minio_client import MinIOClient

app = Flask(__name__)
minio_client = MinIOClient()


@app.route("/", methods=["GET"])
def index():
    return "File Download Service"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port="9002")
