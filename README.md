# Simple Microservice Example

A very simple microservice example with NodeJS, Python, Redis, and Mongo

## Dependencies

### API Gateway/FrontendApplication
* Node

### Data Backends
* MongoDB
* Redis

### QuoteService
* python3
* pip3
* flask
* pymongo
* redis

### Hosting
* NGINX


## Build the frontend

The application uses a frontend written with plain html with jQuery and to style with Bulma.

This is built with webpack. This default application is built assuming you are using the `localhost`.

To build this to fit your own **IP Address** please follow the steps before running the whole microservice.

- Install NodeJs on your system

- Go to *FrontendApplication* directory

- Run `npm install` or if you have yarn `yarn` to install packages

- Now you need to set the API Gateway for this frontend application. It can be any host you have.
    - Let's say you are hosting this application on `http://example.com` then your `API_GATEWAY` would be this one.
    - If you are hosting in some machine with IP `123.324.345.1` then your `API_GATEWAY` would be your IP.

- To pass this setting to webpack build you need to set an Environment Variable
    - Windows : `set API_GATEWAY=http://YOUR_HOST`
    - Linux/Max : `export API_GATEWAY=http://YOUR_HOST`
    * Remember no / at the end of the URL to get your web app work
    * You will need to add a port if not using standard ports

- Now you can do `npm run build` or `yarn build`

- Check `dist/` folder for newly created index.html and the main.js

- Copy `dist/` folder contents to `/var/www/html` to overwrite the default nginx files.

## Initialize MongoDB

Follow the instructions from [Mongo to install MongoDB on Ubuntu.](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/)

Make sure to run the systemd(systemctl) instructions at the end to enable and start MongoDB running as a background service.

Finally make sure you initialize the database admin user and database with starter data.

```bash
mongosh < admin-init.js
mongosh < init-db.js
```

## Initialize Redis

Follow the instructions from [Redis to install Redis on Ubuntu.](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/install-redis-on-linux/)

Then enable/start redis running as a daemon service.

```bash
sudo systemctl enable redis-server
sudo systemctl start redis
sudo systemctl status redis
```

## QuoteService Service

Create a python virtual environment and install the dependencies

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Update the main.py file to point to localhost for mongo and redis. Then update the quote.service file to match your local paths to python and your code. Copy the quote.service file to */etc/systemd/system/quote.service* and then enable the QuoteService daemon service.

```bash
sudo systemctl daemon-reload
sudo systemctl enable quote.service
sudo systemctl start quote
```

## API Gateway

- Go to *ApiGateway* directory

- Run `npm install`

- Update the environment in the apigateway.service file to have your host.
    - `Environment="QUOTES_API=http://YOUR_HOST"`

Now can deploy API Gateway service. Copy the apigateway.service file to */etc/systemd/system/apigateway.service* and then enable the ApiGateway daemon service.

```bash
sudo systemctl daemon-reload
sudo systemctl enable apigateway.service
sudo systemctl start apigateway
```

## NGINX

Now we need to update/change the configuration for NGINX.

```bash
sudo rm /etc/nginx/sites-enabled/default
sudo cp FrontendApplication/vhost.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/vhost.conf /etc/nginx/sites-enabled/default
sudo systemctl restart nginx
```


## Final Result
* check `http://YOUR_HOST:80` to see web app

![image](https://raw.githubusercontent.com/CSUChico-CSCI644/simple-microservice-example/main/working.png)
