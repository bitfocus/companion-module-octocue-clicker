
let actions = {
    config: {
        'control': {
            label: 'Clock start/pause/reset',
            options: [
                {
                    type: 'dropdown',
                    label: 'Action',
                    id: 'control',
                    default: 'start',
                    choices: [
                        { id: 'start', label: 'Start' },
                        { id: 'pause', label: 'Pause' },
                        { id: 'reset', label: 'Reset' },
                    ],
                    required: true,
                },
            ],
        },

        'visibility': {
            label: 'Clock visibility',
            options: [
                {
                    type: 'dropdown',
                    label: 'Action',
                    id: 'action',
                    default: 'show',
                    choices: [
                        { id: 'show', label: 'Show' },
                        { id: 'hide', label: 'Hide' },
                    ],
                    required: true,
                },
            ],
        },

        'jog': {
            label: 'Jog clock time',
            options: [
                {
                    type: 'number',
                    label: 'Seconds (+/-)',
                    id: 'seconds',
                    tooltip: 'The number of seconds to add to the clock. Use negative numbers to remove time.',
                    min: -30000,
                    max: 30000,
                    default: 60,
                    step: 1,
                    required: true,
                    range: false
                }
            ],
        },

        'preset': {
            label: 'Set preset time',
            options: [
                {
                    type: 'number',
                    label: 'Hours',
                    id: 'hours',
                    min: 0,
                    max: 10,
                    default: 0,
                    step: 1,
                    required: true,
                    range: false
                },
                {
                    type: 'number',
                    label: 'Minutes',
                    id: 'minutes',
                    min: 0,
                    max: 59,
                    default: 5,
                    step: 1,
                    required: true,
                    range: false
                },
                {
                    type: 'number',
                    label: 'Seconds',
                    id: 'seconds',
                    min: 0,
                    max: 59,
                    default: 0,
                    step: 1,
                    required: true,
                    range: false
                }
            ],
        },
    },
    doAction(action) {
        let oscAddress = '';
        let oscArgs = [];
        let type = '';
        switch (action.action) {
            case "control":
                let controlType = action.options.control;
                oscAddress = `/octocue/clock/${controlType}`;
                type='osc';
                break;
            case "visibility":
                oscAddress = `/octocue/clock/${action.options.action}`;
                type='osc';
                break;
            case "jog":
                oscAddress = `/octocue/clock/jog`;
                type='osc';
                oscArgs = [ { type: 'i', value: action.options.seconds } ]
                break;
            case "preset":
                oscAddress = `/octocue/clock/preset`;
                type='osc';
                const presetSeconds = (action.options.hours * 3600) + (action.options.minutes * 60) + action.options.seconds;
                oscArgs = [{ type: 'i', value: presetSeconds } ]
                break;
            break; 
            default:
            //not known
        }
        return {type: type, address: oscAddress, args: oscArgs};
    }
}


module.exports = actions;