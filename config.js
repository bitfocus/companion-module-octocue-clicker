config = {
    fields: [
        {
            type: 'text',
            id: 'info',
            width: 12,
            label: 'Information',
            value: 'This module will allow you to control OctoCue clock functions via OSC using Companion.',
        },
        {
            type: 'text',
            id: 'info2',
            width: 12,
            label: 'Minimum version',
            value: "This module connects to OctoCue Receiver on your local network. You'll need Receiver v1.5 or later.",
        },
        {
            type: 'textinput',
            id: 'host',
            label: 'Local OctoCue receiver IP address:',
            width: 6,
            regex: this.REGEX_IP,
            default: "127.0.0.1"
        }
    ]
}

module.exports = config;