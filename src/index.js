const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const tough = require('tough-cookie');

const parser = require("htmlparser2");

const jar = new tough.CookieJar();
const client = wrapper(axios.create({ jar }));

const CONFIG = require('./config.js');
const USER = require('./credentials.json');

function toID (text) {
	return (text.toString?.() || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

if (!CONFIG.strictQuestions) Object.keys(USER.questions).forEach(key => USER.questions[toID(key)] = USER.questions[key]);

function parseRow (row) {
	const cells = row.children;
	const [, type, subject, company, fullPost, , timestamp] = cells.map(cell => cell.children[0].data.slice(7, -2));
	const post = fullPost.replace(/<[^>]+>/g, '').replace(/\d\d?:\d\d [AP]M(?=\d)/g, m => m + '\n').replace(/(?<!\n)\d\./g, m => '\n' + m).replace(/ {3,}CDC/g, m => m.slice(0, -3) + '\n\n' + 'CDC');
	const split = timestamp.split('-');
	[split[1], split[0]] = [split[0], split[1]];
	const time = new Date(new Date(split.join('-')).getTime() + (new Date().getTimezoneOffset() + 5.5 * 60) * 60_000);
	return { type, subject, company, post, time: time };
}

async function getData () {
	const getSessionToken = await client.get('https://erp.iitkgp.ac.in/IIT_ERP3');
	const sessionToken = getSessionToken.request.path.split('sessionToken=')[1].split('&')[0];
	let securityAnswer;
	while (!securityAnswer) {
		const securityRequest = await client.post('https://erp.iitkgp.ac.in/SSOAdministration/getSecurityQues.htm', { user_id: USER.roll }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } });
		const securityQuestion = (CONFIG.strictQuestions ? x => x : toID)(securityRequest.data);
		if (!USER.questions.hasOwnProperty(securityQuestion)) throw new Error(`Did not have security question: ${securityQuestion}`);
		if (USER.questions[securityQuestion]) securityAnswer = USER.questions[securityQuestion];
	}
	await client.post('https://erp.iitkgp.ac.in/SSOAdministration/auth.htm', {
		user_id: USER.roll,
		password: USER.password,
		answer: securityAnswer,
		sessionToken,
		requestedUrl: 'https://erp.iitkgp.ac.in/IIT_ERP3/home.htm'
	}, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
	await client.get('https://erp.iitkgp.ac.in/IIT_ERP3/menulist.htm?module_id=26');
	/*await client.post('https://erp.iitkgp.ac.in/IIT_ERP3/showmenu.htm', {
		module_id: '26',
		menu_id: '11',
		link: 'https://erp.iitkgp.ac.in/TrainingPlacementSSO/TPStudent.jsp',
		module_name: 'CDC',
		parent_display_name: 'Student',
		display_name: 'Application of Placement/Internship'
	});
	await client.post('https://erp.iitkgp.ac.in/TrainingPlacementSSO/TPStudent.jsp', {
		ssoToken: sessionToken,
		module_id: '26',
		menu_id: '11'
	});*/
	await client.get('https://erp.iitkgp.ac.in/TrainingPlacementSSO/Notice.jsp');
	// const data = await client.get('https://erp.iitkgp.ac.in/TrainingPlacementSSO/ERPMonitoring.htm?action=fetchData&jqqueryid=37&_search=false&rows=20&page=1&sidx=&sord=asc&totalrows=50');
	const noticeBoard = await client.get('https://erp.iitkgp.ac.in/TrainingPlacementSSO/ERPMonitoring.htm?action=fetchData&jqqueryid=54&_search=false&rows=20&page=1&sidx=&sord=asc&totalrows=50');
	const table = parser.parseDocument(noticeBoard.data).children[2];
	table.children.pop();
	const rows = table.children.map(row => {
		try {
			return parseRow(row);
		} catch (e) {
			return {};
		}
	});

	// You can change the code here based on what you want to filter
	const schedules = rows.filter(row => row.subject === 'Schedule');
	const latest = schedules.slice(0, 2);
	return latest;
}

getData().then(console.log);
