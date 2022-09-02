import app from './app';

const port = process.env.PORT || 5000;
// app.listen(port, () => {
//   /* eslint-disable no-console */
//   console.log(`Listening: http://localhost:${port}`);
//   /* eslint-enable no-console */
// });

app.listen(process.env.PORT || 3000, function () {
    console.log('Express server listening on port %d in %s mode', port, app.settings.env);
});
