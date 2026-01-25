// Preset input patterns for 8x8 grid (64 inputs)
// Values are 0-1 activation levels

export type PatternPreset = {
    name: string;
    label: string;
    pattern: number[];
};

// Helper to create an 8x8 grid pattern
function createPattern(grid: string[]): number[] {
    const pattern: number[] = [];
    for (let row = 0; row < 8; row++) {
        const line = grid[row] || '        ';
        for (let col = 0; col < 8; col++) {
            const char = line[col] || ' ';
            pattern.push(char === '#' ? 1.0 : char === '.' ? 0.4 : 0);
        }
    }
    return pattern;
}

export const inputPatternPresets: PatternPreset[] = [
    {
        name: 'zero',
        label: '0',
        pattern: createPattern([
            ' .##. ',
            '.#  #.',
            '#    #',
            '#    #',
            '#    #',
            '#    #',
            '.#  #.',
            ' .##. ',
        ]),
    },
    {
        name: 'one',
        label: '1',
        pattern: createPattern([
            '  .#  ',
            ' .##  ',
            '  ##  ',
            '  ##  ',
            '  ##  ',
            '  ##  ',
            '  ##  ',
            ' #### ',
        ]),
    },
    {
        name: 'two',
        label: '2',
        pattern: createPattern([
            ' .##. ',
            '.#  #.',
            '    #.',
            '   #. ',
            '  #.  ',
            ' #.   ',
            '.#    ',
            '######',
        ]),
    },
    {
        name: 'three',
        label: '3',
        pattern: createPattern([
            ' .##. ',
            '.#  #.',
            '    #.',
            '  ##. ',
            '    #.',
            '    #.',
            '.#  #.',
            ' .##. ',
        ]),
    },
    {
        name: 'circle',
        label: '○',
        pattern: createPattern([
            '  ....  ',
            ' .####. ',
            '.##  ##.',
            '.#    #.',
            '.#    #.',
            '.##  ##.',
            ' .####. ',
            '  ....  ',
        ]),
    },
    {
        name: 'cross',
        label: '+',
        pattern: createPattern([
            '   ##   ',
            '   ##   ',
            '   ##   ',
            '########',
            '########',
            '   ##   ',
            '   ##   ',
            '   ##   ',
        ]),
    },
    {
        name: 'diagonal',
        label: '/',
        pattern: createPattern([
            '      ##',
            '     ## ',
            '    ##  ',
            '   ##   ',
            '  ##    ',
            ' ##     ',
            '##      ',
            '#       ',
        ]),
    },
    {
        name: 'random',
        label: '?',
        pattern: [], // Special: will generate random at runtime
    },
];

export function generateRandomPattern(): number[] {
    return Array.from({ length: 64 }, () => Math.random() > 0.7 ? Math.random() : 0);
}
