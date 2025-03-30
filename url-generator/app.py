from flask import Flask, jsonify

from url_generator.minio_client import MinIOClient

app = Flask(__name__)
minio_client = MinIOClient()


@app.route("/", methods=["GET"])
def index():
    return "File Download Service"


@app.route("/files", methods=["GET"])
def get_files():
    try:
        files = minio_client.file_list()
        return jsonify(files)
    except Exception as e:
        app.logger.error(f"{e}")
        return jsonify({"error": "Failed to get file list"}), 500


@app.route("/url/<string:file_name>/<int:expiry>", methods=["GET"])
def generate_url(file_name, expiry):
    url = minio_client.generate_download_url(file_name, expiry)
    if url:
        return jsonify({"file_name": file_name, "url": url})
    else:
        return jsonify({"error": "Failed to generate presigned URL"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port="9002")
