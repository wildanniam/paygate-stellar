// Independent, illustrative records. A response code never establishes payment state.
// In V1 a payment may be credited before an upstream request fails.
const weather = {
  name: 'Weather API', endpoint: '/weather?city=Jakarta',
  gross: '0.010', net: '0.009', fee: '0.001', paymentStatus: 'credited',
};

export const RECEIPT_EXAMPLES = [
  {
    ...weather, id: 'delivered', label: 'Delivered', detail: 'Payment + response recorded',
    request: 'req_demo_weather_01', shortRequest: 'weather_01', payment: 'pay_demo_weather_01',
    responseStatus: 200, responseLabel: '200 OK', outcome: 'Response delivered',
    result: '29°C · Partly cloudy', sequence: '01',
    caption: 'Payment recorded. The client received the data.',
  },
  {
    ...weather, id: 'upstream-error', label: 'API error', detail: 'Payment recorded · API failed',
    request: 'req_demo_weather_02', shortRequest: 'weather_02', payment: 'pay_demo_weather_02',
    responseStatus: 502, responseLabel: '502 Bad Gateway', outcome: 'Upstream failed',
    result: 'Upstream unavailable', sequence: '02',
    caption: 'Payment recorded. The upstream request failed.',
  },
];
