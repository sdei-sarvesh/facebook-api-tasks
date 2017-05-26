# facebook-api-tasks
Delete a facebook fanpage comment based on certain negative keywords
## Getting Started

To get you started you can simply clone the `facebook-api-tasks` repository and install the dependencies:

### Prerequisites

You need git to clone the `facebook-api-tasks` repository. You can get git from [here][git].

We also use a number of Node.js tools to initialize and test `facebook-api-tasks`. You must have Node.js
and its package manager (npm) installed. You can get them from [here][node].

### Clone `facebook-api-tasks`

Clone the `facebook-api-tasks` repository using git:

```
git clone https://github.com/ybiinc/facebook-api-tasks.git
cd facebook-api-tasks
```

### Install Dependencies

We have node dependencies in this project

* We get the node packages we depend upon via `npm`, the [Node package manager][npm].

We have preconfigured `npm` to automatically install `node_module` so you can simply do:

```
npm install
```

After installing the node_modules you need to need to start you application.


### Run the Application

We have preconfigured the project with a simple development web server. The simplest way to start
this server is:

```
npm start
```

Now browse to the app at [`localhost:5000`][local-app-url].

###How to test application
Step 1- authenticate user with facebook account.
Step 2- Add keyword by clicking link from top right corner in profile page.
Step 3- Go to the Fb Fan Pages by clicking on link from profile page.
Step 4- Deleting comment by clicking delete comment button from table and Based on Given keywords, comments will be removed from fanpage.
Step 5 - Once comments deleted then it will be redirected to the success pages.

###Automatically remove comment
Once steps 3 completed then automatically comments will be deleted from fan pages based on keywords by scheduler script executing in backend process.


## Contact

For more information.

[local-app-url]: http://localhost:5000/
[node]: https://nodejs.org/
[npm]: https://www.npmjs.org/
