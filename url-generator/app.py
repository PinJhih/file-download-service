from flask import Flask, jsonify, render_template

from url_generator.minio_client import MinIOClient
from url_generator.shorten_proxy import generate_shorten_url

app = Flask(__name__)
minio_client = MinIOClient()


@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")


@app.route("/generator/<string:file_name>", methods=["GET"])
def generator(file_name):
    return render_template("generator.html")


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
    minio_url = minio_client.generate_download_url(file_name, expiry)
    shorten_url = generate_shorten_url(file_name, minio_url, expiry)

    if minio_url:
        return jsonify({"file_name": file_name, "url": shorten_url})
    else:
        return jsonify({"error": "Failed to generate presigned URL"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port="9002")
