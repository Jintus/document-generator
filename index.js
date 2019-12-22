const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const hbs = require('handlebars');
const path = require('path');
const moment = require('moment');

moment.locale('fr');


const compile = async function(templateName, data) {
    const filePath = path.join(process.cwd(), 'templates', templateName+'.hbs');
    const html = await fs.readFile(filePath, 'utf-8');
    return hbs.compile(html)(data);
};

const generatePDF = async function (template, data, fileName) {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const content = await compile(template, data);

        await page.setContent(content);
        await page.emulateMedia('screen');
        await page.pdf({
            path: 'out/'+fileName+'.pdf',
            format: 'A4',
            printBackground: true
        });

        console.log('Document generated');
        await browser.close();
        process.exit();
    }
    catch (e) {
        console.log('Error', e);
    }
};

hbs.registerHelper('dateFormat', function(value, format){
   return moment(value).format(format, 'fr').toLowerCase();
});


const currentDay = moment();
var lastDay = moment();

while(lastDay.date() != 2){
    lastDay.add(1, 'days');
}

const data = {
    currentDay : currentDay.format(),
    lastDay : lastDay.format()
}
generatePDF('echeance', data, lastDay.format('YYYY-MM')+' Echéance loyer');