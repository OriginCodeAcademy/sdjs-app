import axios from 'axios';

export function updateFirstNameInput(text) {
	return {
		type: 'UPDATE_FIRST_NAME_INPUT',
		payload: text
	}
}

export function updateLastNameInput(text) {
	return {
		type: 'UPDATE_LAST_NAME_INPUT',
		payload: text
	}
}

export function updateEmailInput(text) {
	return {
		type: 'UPDATE_EMAIL_INPUT',
		payload: text
	}
}

export function updatePasswordInput(text) {
	return {
		type: 'UPDATE_PASSWORD_INPUT',
		payload: text
	}
}

export function submitSignUp(credentials, navigate) {
	return {
		type: 'SUBMIT_SIGN_UP',
		payload: axios
			.post('http://2e780eb3.ngrok.io/api/users', credentials)
			.then(response => {
				const statusCode = RegExp('422*');
				const signUpRes = response.data;
				// Must force error with if statement b/c Loopback does not send a failing res.status for repeat emails
				if (statusCode.test(signUpRes)) {
					console.log(statusCode.test(signUpRes));
					throw {error: 'invalid'}
				}
				else {
					navigate('Questionnaire');
					const {email, password} = credentials;
					return axios
						.post('http://2e780eb3.ngrok.io/api/users/login', {email, password})
						.then(r => r.data);
				}
			})
			.catch(error => {
				console.log(error.message);
				alert('An account exists for this email address. Please try again.');
			})
	}
}

export function thirdPartyLogin(loginObj) {
	return {
		type: 'THIRD_PARTY_LOGIN',
		payload: axios
			.post('http://2e780eb3.ngrok.io/loginthirdparty', loginObj)
			.then(response => response.data)
			.catch(error => {
				console.log("this one", error);
			})
	};
}
