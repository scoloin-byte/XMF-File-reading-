# F1 25 XMF Reader

A web application to read, parse, and visualize tire and engine data from F1 25 XMF files.

## Features

✨ **Core Features:**
- 📁 Upload and parse XMF files from F1 25
- 📊 Interactive data visualization with charts
- 🔄 Support for multiple file uploads
- 📈 Display tire grip characteristics (lateral and longitudinal)
- 🔥 Wear and blistering analysis
- 🏎️ Detailed parametric data tables
- 🌙 Dark mode UI optimized for readability

## Getting Started

### Installation

1. Clone this repository:
```bash
git clone https://github.com/scoloin-byte/XMF-File-reading-.git
cd XMF-File-reading-
```

2. Open `index.html` in a modern web browser:
   - Simply double-click the file, or
   - Use a local server (recommended):
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Python 2
   python -m SimpleHTTPServer 8000
   
   # Using Node.js (if you have http-server installed)
   http-server
   ```
   Then navigate to `http://localhost:8000`

### Usage

1. **Upload Files**: Click the upload area or drag & drop XMF files
2. **View Data**: Files appear as cards; click a card to view its data
3. **Analyze**: View detailed tables and interactive charts
4. **Compare**: Load multiple files to compare tire characteristics

## Data Displayed

### Tire Parameters
- **Lateral Grip Curve**: Peak grip coefficient across various loads
- **Longitudinal Grip Curve**: Braking/acceleration grip characteristics
- **Dynamic Camber**: Camber angle effects on grip
- **Wear Rate**: Tire degradation rate
- **Blistering**: Temperature-dependent blister formation

### Charts
- Interactive line charts showing grip vs. load
- Peak, minimum, and maximum grip values
- Responsive design for all screen sizes

## File Structure

```
.
├── index.html       # Main HTML structure
├── app.js          # Core application logic and XMF parser
└── README.md       # This file
```

## XMF File Format

XMF files are XML-based files containing tire compound data for F1 25. The parser extracts:
- Compound name
- Tire model type (MNC, etc.)
- Parametric load data (lateral and longitudinal)
- Wear characteristics
- Blistering parameters

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Technologies Used

- **Vanilla JavaScript** - Core application logic
- **Chart.js** - Data visualization
- **HTML5** - Markup structure
- **CSS3** - Styling and responsive design

## Future Enhancements

- [ ] Export data to CSV/JSON
- [ ] Multi-file comparison views
- [ ] Engine data parsing
- [ ] Advanced filtering and search
- [ ] Data trend analysis
- [ ] Historical data tracking
- [ ] Performance metrics

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for your own purposes.

## Disclaimer

This tool is for educational and data analysis purposes. F1 is a trademark of Formula 1 World Championship Limited.
