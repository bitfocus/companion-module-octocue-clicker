module.exports = {

    /**
    * Get the available feedbacks.
    *
    * @returns {Object[]} the available feedbacks
    * @access public
    * @since 1.1.0
    */

    getFeedbacks() {
        var feedbacks = {}

        feedbacks['state_colour'] = {
            label: 'Change colour to match clock colour',
            description: 'Match the clock colour (green, orange & red states)',
            options: [
                {
                    type: 'colorpicker',
                    label: 'Green state foreground',
                    id: 'colGreenFg',
                    default: this.rgb(255,255,255)
                },
                {
                    type: 'colorpicker',
                    label: 'Green state background',
                    id: 'colGreenBg',
                    default: this.rgb(140,197,66)
                },
                {
                    type: 'colorpicker',
                    label: 'Orange state foreground',
                    id: 'colOrangeFg',
                    default: this.rgb(0,0,0)
                },
                {
                    type: 'colorpicker',
                    label: 'Orange state background',
                    id: 'colOrangeBg',
                    default: this.rgb(240,216,78)
                },
                {
                    type: 'colorpicker',
                    label: 'Red state foreground',
                    id: 'colRedFg',
                    default: this.rgb(254,255,255)
                },
                {
                    type: 'colorpicker',
                    label: 'Red state background',
                    id: 'colRedBg',
                    default: this.rgb(254,0,0)
                }
            ],
            callback: (feedback, bank) => {
                //console.log(`Check ${this.feedbackstate.colour}`);
                if (this.feedbackstate.colour == 'green') {
                    return {
                        color: feedback.options.colGreenFg,
                        bgcolor: feedback.options.colGreenBg
                    }
                } else if (this.feedbackstate.colour == 'orange') {
                    return {
                        color: feedback.options.colOrangeFg,
                        bgcolor: feedback.options.colOrangeBg
                    };
                }
                else if (this.feedbackstate.colour == 'red') {
                    return {
                        color: feedback.options.colRedFg,
                        bgcolor: feedback.options.colRedBg
                    };
                }
            }
        },
        feedbacks['mode_color'] = {
            label: 'Change color from display mode',
            description: 'Change the colors of a bank according to the current display mode',
            options: [
                {
                    type: 'dropdown',
                    label: 'Mode',
                    id: 'mode',
                    choices: [
                        { id: 'TIMER', label: 'Timer'},
                        { id: 'CLOCK', label: 'Clock'},
                        { id: 'BLACK', label: 'Black'},
                        { id: 'TEST',  label: 'Test'}
                    ],
                    default: 'TIMER'
                },
                {
                    type: 'colorpicker',
                    label: 'Foreground color',
                    id: 'fg',
                    default: this.rgb(255,255,255)
                },
                {
                    type: 'colorpicker',
                    label: 'Background color',
                    id: 'bg',
                    default: this.rgb(255,0,0)
                }
            ],
            callback: (feedback, bank) => {
                if (this.feedbackstate.mode == feedback.options.mode) {
                    return {
                        color: feedback.options.fg,
                        bgcolor: feedback.options.bg
                    };
                }
            }
        }

        return feedbacks;
    }
}