const gulp = require('gulp');
const brotli = require('gulp-brotli');
const merge = require('event-stream').merge;
const path = require('path');
const ora = require('ora');

// configure input, output and processors:

const inputDir = `${__dirname}/../resources/`;
const webModules = `${__dirname}/web_modules`;
const outputDir = inputDir;
const srcStream = () => gulp.src([
    `${inputDir}**/*.*`,
    `!${inputDir}**/*.br`
]);
const moduleStream = () => gulp.src([
    `${webModules}/**/*.*`,
    `!${webModules}/**/*.br`
]);

const brotliSettings = {
    extension: 'br',
    skipLarger: true,
    mode: 0,
    quality: 11, // maximum compression
    lgblock: 0
};

// process input and write output to disk:

const brotliCompress = (src, dest) => src()
    .pipe(brotli.compress(brotliSettings))
    .pipe(gulp.dest(dest));

const compress = () => {
    const spinner = ora('Compressing files').start();
    merge([
        brotliCompress(srcStream, outputDir),
        brotliCompress(moduleStream, webModules)
    ])
    .on('end', () => spinner.succeed(`Compressed files saved to \`${path.relative(process.cwd(), outputDir)}/\`.`));
};

compress();