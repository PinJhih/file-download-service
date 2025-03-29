FROM python:3.10-slim

WORKDIR /app
COPY . /app/

RUN pip install -r requirements.txt

EXPOSE 9002
CMD [ "python3", "app.py" ]
