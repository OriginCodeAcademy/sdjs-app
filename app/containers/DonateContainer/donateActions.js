export function cardholderNameEntry(text) {
  return {
    type: 'CARD_NAME_ENTRY',
    payload: text
  };
}

export function zipCodeEntry(number) {
  return {
    type: 'ZIP_CODE_ENTRY',
    payload: number
  };
}

export function cardNumberEntry(number) {
  return {
    type: 'CARD_NUM_ENTRY',
    payload: number
  };
}

export function cardExpMonthEntry(number) {
  return {
    type: 'CARD_EXPMONTH_ENTRY',
    payload: number
  };
}

export function cardExpYearEntry(number) {
  return {
    type: 'CARD_EXPYEAR_ENTRY',
    payload: number
  };
}

export function cardCvcEntry(number) {
  return {
    type: 'CARD_CVC_ENTRY',
    payload: number
  };
}

export function handleTransaction(cardDetails, amount, navigate, dispatch) {
  let cardToken;
  let formBody = [];
  for (const property in cardDetails) {
    const encodedKey = encodeURIComponent(property);
    const encodedValue = encodeURIComponent(cardDetails[property]);
    formBody.push(`${encodedKey}=${encodedValue}`);
  }
  formBody = formBody.join('&');
  return {
    type: 'HANDLE_TRANSACTION',
    payload: fetch('https://api.stripe.com/v1/tokens', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Bearer ' + 'sk_test_mKN6tShrC00GTyAn8onN7aAg'
      },
      body: formBody
    }).then((response) => {
      response.json().then(solved => cardToken = solved.id).then(cardToken => (performTransaction(cardToken, amount)));
      {
        if (response.status === 200) {
          navigate('ThankYou');
          return response.status;
        }
        alert('Your transaction did not go through, please check your credit card information.');
        return null;
      }
    })
  };
}

function performTransaction(cardToken, amount) {
  const charge = {
    amount,
    currency: 'usd',
    description: 'SDJS donation',
    source: cardToken,
    statement_descriptor: 'Donation to SD JS'
  };
  let formBody = [];
  for (const property in charge) {
    const encodedKey = encodeURIComponent(property);
    const encodedValue = encodeURIComponent(charge[property]);
    formBody.push(`${encodedKey}=${encodedValue}`);
  }
  formBody = formBody.join('&');
  fetch('https://api.stripe.com/v1/charges', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Bearer ' + 'sk_test_mKN6tShrC00GTyAn8onN7aAg'
    },
    body: formBody
  })
    .then((response) => {
      response.json().then(solved => solved.status);
    }).catch((err) => { console.log(err); });
}
