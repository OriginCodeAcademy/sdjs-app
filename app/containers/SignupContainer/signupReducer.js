const defaultState = {
    firstNameInput: '',
    lastNameInput: '',
    emailInput: '',
    passwordInput: '',
    user: {
		id: '',
		token: ''
	}
};

export default function signupReducer(state = defaultState, action) {
    const { type, payload } = action;

    switch (type) {

        case 'UPDATE_FIRST_NAME_INPUT': {
            return {
                ...state,
                firstNameInput: payload
            }
        }

        case 'UPDATE_LAST_NAME_INPUT': {
            return {
                ...state,
                lastNameInput: payload
            }
        }

        case 'UPDATE_EMAIL_INPUT': {
            return {
                ...state,
                emailInput: payload
            }
        }

        case 'UPDATE_PASSWORD_INPUT': {
            return {
                ...state,
                passwordInput: payload
            }
        }

        case 'SUBMIT_SIGN_UP_FULFILLED': {
            return {
                ...state,
                user: payload
            }
        }

        case 'THIRD_PARTY_LOGIN_FULFILLED': {
            return {
                ...state,
                user: payload,
            }
        }

        default: {
            return state;
        }
    }
}
