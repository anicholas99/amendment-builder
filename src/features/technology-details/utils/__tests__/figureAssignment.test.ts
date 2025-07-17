import {
  extractFigureNumber,
  assignFigureNumbers,
  reorderFigures,
  resetFigureNumbers,
} from '../figureAssignment';

describe('figureAssignment', () => {
  describe('extractFigureNumber', () => {
    it('should extract numbers from common figure patterns', () => {
      expect(extractFigureNumber('fig1.png')).toBe('1');
      expect(extractFigureNumber('figure1.jpg')).toBe('1');
      expect(extractFigureNumber('fig_1.png')).toBe('1');
      expect(extractFigureNumber('figure_1.pdf')).toBe('1');
      expect(extractFigureNumber('fig-1.png')).toBe('1');
      expect(extractFigureNumber('figure-1.jpg')).toBe('1');
      expect(extractFigureNumber('FIG1.PNG')).toBe('1');
      expect(extractFigureNumber('FIGURE1.JPG')).toBe('1');
    });

    it('should extract alphanumeric numbers from figure patterns', () => {
      expect(extractFigureNumber('fig1A.png')).toBe('1A');
      expect(extractFigureNumber('figure1B.jpg')).toBe('1B');
      expect(extractFigureNumber('fig_1C.png')).toBe('1C');
      expect(extractFigureNumber('figure_1d.pdf')).toBe('1D');
      expect(extractFigureNumber('fig-1E.png')).toBe('1E');
      expect(extractFigureNumber('figure-1f.jpg')).toBe('1F');
      expect(extractFigureNumber('FIG1G.PNG')).toBe('1G');
      expect(extractFigureNumber('FIGURE1h.JPG')).toBe('1H');
    });

    it('should extract numbers from drawing patterns', () => {
      expect(extractFigureNumber('drawing1.png')).toBe('1');
      expect(extractFigureNumber('dwg1.jpg')).toBe('1');
      expect(extractFigureNumber('diagram1.png')).toBe('1');
      expect(extractFigureNumber('diag1.pdf')).toBe('1');
      expect(extractFigureNumber('drawing1A.png')).toBe('1A');
      expect(extractFigureNumber('dwg1B.jpg')).toBe('1B');
    });

    it('should extract numbers from image patterns', () => {
      expect(extractFigureNumber('image1.png')).toBe('1');
      expect(extractFigureNumber('img1.jpg')).toBe('1');
      expect(extractFigureNumber('image1A.png')).toBe('1A');
      expect(extractFigureNumber('img1B.jpg')).toBe('1B');
    });

    it('should extract numbers from numeric filenames', () => {
      expect(extractFigureNumber('1.png')).toBe('1');
      expect(extractFigureNumber('01.jpg')).toBe('1');
      expect(extractFigureNumber('15.pdf')).toBe('15');
      expect(extractFigureNumber('1A.png')).toBe('1A');
      expect(extractFigureNumber('01B.jpg')).toBe('1B');
      expect(extractFigureNumber('15C.pdf')).toBe('15C');
    });

    it('should extract numbers at the end of filenames', () => {
      expect(extractFigureNumber('patent_1.png')).toBe('1');
      expect(extractFigureNumber('invention-1.jpg')).toBe('1');
      expect(extractFigureNumber('my-drawing-5.pdf')).toBe('5');
      expect(extractFigureNumber('patent_1A.png')).toBe('1A');
      expect(extractFigureNumber('invention-1B.jpg')).toBe('1B');
      expect(extractFigureNumber('my-drawing-5C.pdf')).toBe('5C');
    });

    it('should return null for filenames without numbers', () => {
      expect(extractFigureNumber('image.png')).toBeNull();
      expect(extractFigureNumber('drawing.jpg')).toBeNull();
      expect(extractFigureNumber('patent.pdf')).toBeNull();
    });

    it('should ignore numbers outside reasonable range', () => {
      expect(extractFigureNumber('fig0.png')).toBeNull();
      expect(extractFigureNumber('figure100.jpg')).toBeNull();
      expect(extractFigureNumber('fig-999.pdf')).toBeNull();
      expect(extractFigureNumber('fig0A.png')).toBeNull();
      expect(extractFigureNumber('figure100B.jpg')).toBeNull();
    });

    it('should handle multi-digit numbers', () => {
      expect(extractFigureNumber('fig10.png')).toBe('10');
      expect(extractFigureNumber('figure_25.jpg')).toBe('25');
      expect(extractFigureNumber('drawing-99.pdf')).toBe('99');
      expect(extractFigureNumber('fig10A.png')).toBe('10A');
      expect(extractFigureNumber('figure_25B.jpg')).toBe('25B');
      expect(extractFigureNumber('drawing-99C.pdf')).toBe('99C');
    });
  });

  describe('assignFigureNumbers', () => {
    it('should use detected numbers when available', () => {
      const files = ['fig1.png', 'fig2.jpg', 'fig3.pdf'];
      const result = assignFigureNumbers(files);

      expect(result[0].assignedNumber).toBe('1');
      expect(result[1].assignedNumber).toBe('2');
      expect(result[2].assignedNumber).toBe('3');
    });

    it('should fill gaps with sequential numbers', () => {
      const files = ['fig1.png', 'random.jpg', 'fig3.pdf'];
      const result = assignFigureNumbers(files);

      expect(result[0].assignedNumber).toBe('1');
      expect(result[1].assignedNumber).toBe('2'); // Filled gap
      expect(result[2].assignedNumber).toBe('3');
    });

    it('should handle duplicate detected numbers', () => {
      const files = ['fig1.png', 'figure1.jpg', 'fig2.pdf'];
      const result = assignFigureNumbers(files);

      expect(result[0].assignedNumber).toBe('1'); // Gets its detected number
      expect(result[1].assignedNumber).toBe('2'); // Can't use 1 (taken), gets next available
      expect(result[2].assignedNumber).toBe('3'); // Can't use 2 (taken), gets next available
    });

    it('should assign sequential numbers when no patterns detected', () => {
      const files = ['image.png', 'drawing.jpg', 'patent.pdf'];
      const result = assignFigureNumbers(files);

      expect(result[0].assignedNumber).toBe('1');
      expect(result[1].assignedNumber).toBe('2');
      expect(result[2].assignedNumber).toBe('3');
    });

    it('should handle mixed detected and undetected patterns', () => {
      const files = ['random1.png', 'fig5.jpg', 'another.pdf', 'fig2.png'];
      const result = assignFigureNumbers(files);

      expect(result[0].assignedNumber).toBe('1'); // Gets its detected number
      expect(result[1].assignedNumber).toBe('5'); // Gets its detected number
      expect(result[2].assignedNumber).toBe('2'); // No detection, gets next available
      expect(result[3].assignedNumber).toBe('3'); // Can't use 2 (taken), gets next available
    });

    it('should handle alphanumeric detected numbers', () => {
      const files = ['fig1A.png', 'fig1B.jpg', 'fig2A.pdf'];
      const result = assignFigureNumbers(files);

      expect(result[0].assignedNumber).toBe('1A');
      expect(result[1].assignedNumber).toBe('1B');
      expect(result[2].assignedNumber).toBe('2A');
    });
  });

  describe('reorderFigures', () => {
    it('should reorder figures and reassign numbers', () => {
      const figures = [
        { id: '1', assignedNumber: '1', fileName: 'fig1.png' },
        { id: '2', assignedNumber: '2', fileName: 'fig2.png' },
        { id: '3', assignedNumber: '3', fileName: 'fig3.png' },
      ];

      // Move first figure to last position
      const result = reorderFigures(figures, 0, 2);

      expect(result[0].id).toBe('2');
      expect(result[0].assignedNumber).toBe('1');
      expect(result[1].id).toBe('3');
      expect(result[1].assignedNumber).toBe('2');
      expect(result[2].id).toBe('1');
      expect(result[2].assignedNumber).toBe('3');
    });

    it('should handle moving to earlier position', () => {
      const figures = [
        { id: '1', assignedNumber: '1', fileName: 'fig1.png' },
        { id: '2', assignedNumber: '2', fileName: 'fig2.png' },
        { id: '3', assignedNumber: '3', fileName: 'fig3.png' },
      ];

      // Move last figure to first position
      const result = reorderFigures(figures, 2, 0);

      expect(result[0].id).toBe('3');
      expect(result[0].assignedNumber).toBe('1');
      expect(result[1].id).toBe('1');
      expect(result[1].assignedNumber).toBe('2');
      expect(result[2].id).toBe('2');
      expect(result[2].assignedNumber).toBe('3');
    });
  });

  describe('resetFigureNumbers', () => {
    it('should reset figure numbers to sequential order', () => {
      const figures = [
        { id: '1', assignedNumber: '5', fileName: 'fig5.png' },
        { id: '2', assignedNumber: '2', fileName: 'fig2.png' },
        { id: '3', assignedNumber: '8', fileName: 'fig8.png' },
      ];

      const result = resetFigureNumbers(figures);

      expect(result[0].assignedNumber).toBe('1');
      expect(result[1].assignedNumber).toBe('2');
      expect(result[2].assignedNumber).toBe('3');
    });
  });
});
