# Terra Revenues

This is simple project, a site to see how much revenue protocols on Terra generate. With main purpose to help people analyze project. Currently there are only few protocols added, more will come with time.

## Running on your own

To run site on your own run(you need to have npm installed):
```
git clone https://github.com/0xGrga/terra-revenues
cd terra-revenues
npm install
npm start
```

### Testing

If you added/modded some of code, you can test it with: `npm test`

This launches interactive test runner, that will help with finding error and bugs in project

### Building project

To build run: `npm run build`

This will build project, after than you can find all files needed for hosting a site in `build` folder. After that you can run:

```
npm install -g serve
serve -s build
```

to host the site on local machine, but in most cases you want to take those files and upload them to a proper server
