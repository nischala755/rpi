# 🌪️ Interactive PINN Windmill Digital Twin

A sophisticated AR/VR digital twin of a wind turbine powered by Physics-Informed Neural Networks (PINN) using Three.js, WebXR, and TensorFlow.js. This interactive application allows real-time parameter tweaking to understand how different conditions affect windmill performance and PINN predictions.

![Windmill Digital Twin](https://img.shields.io/badge/AR%2FVR-Compatible-brightgreen) ![PINN](https://img.shields.io/badge/AI-PINN%20Enabled-blue) ![Three.js](https://img.shields.io/badge/3D-Three.js-orange)

## 🚀 Features

### 🧠 **Physics-Informed Neural Network (PINN)**
- Real-time fluid dynamics simulation using TensorFlow.js
- Navier-Stokes equation integration for realistic wind flow
- Interactive neural network visualization with live neuron activation
- Adaptive learning rate and physics weight adjustment
- Real-time prediction accuracy monitoring

### 🎛️ **Interactive Parameter Control**
- **Wind Conditions**: Speed (0-30 m/s), Direction (-180° to 180°), Turbulence (0-50%)
- **Turbine Control**: Blade pitch (-5° to 35°), Nacelle yaw, Generator load (0-120%)
- **PINN Settings**: Learning rate, Physics constraint weights
- **Real-time Impact**: See immediate effects on windmill performance

### 📊 **Advanced Analytics Dashboard**
- Power output monitoring (0-2000 kW)
- Efficiency calculations with visual progress bars
- Tip speed ratio optimization
- Turbulence level assessment
- Nacelle yaw tracking

### 🎭 **Scenario Presets**
- **🌤️ Calm Weather**: Low wind, minimal turbulence
- **⚡ Optimal Conditions**: Peak efficiency parameters
- **⛈️ Storm Conditions**: High wind with extreme turbulence
- **🔧 Maintenance Mode**: Safe shutdown conditions
- **🌪️ High Turbulence**: Challenging wind patterns

### 🥽 **VR/AR Support**
- Full WebXR compatibility for Oculus Quest/Quest 3
- Immersive 3D windmill visualization
- Hand controller support
- Spatial interaction capabilities

### 🎨 **Visual Excellence**
- 5000+ wind particles showing real-time flow patterns
- Physics-based blade dynamics with proper inertia
- PBR (Physically-Based Rendering) materials
- Advanced lighting with atmospheric effects
- Dynamic shadows and fog effects

## 📋 Prerequisites

### System Requirements
- **Browser**: Chrome 90+, Edge 90+, Firefox 90+, Safari 14+
- **GPU**: WebGL 2.0 compatible graphics card
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: No installation required (web-based)

### For VR/AR Experience
- **VR Headset**: Oculus Quest, Quest 2, Quest 3, or WebXR-compatible device
- **Network**: Same Wi-Fi network as host computer
- **Browser**: Oculus Browser or compatible WebXR browser

## 🛠️ Installation & Setup

### Method 1: Quick Start (Python)
```bash
# Clone or download the repository
cd "ar_vr project"

# Start HTTP server (Python 3)
python -m http.server 8080

# Access the application
# Open browser: http://localhost:8080/interactive-windmill.html
```

### Method 2: Alternative Server (Node.js)
```bash
# Install http-server globally
npm install -g http-server

# Start server
http-server -p 8080

# Access: http://localhost:8080/interactive-windmill.html
```

### Method 3: Live Server (VS Code)
1. Install "Live Server" extension in VS Code
2. Right-click on `interactive-windmill.html`
3. Select "Open with Live Server"

## 🎮 Usage Guide

### Desktop Experience
1. **Launch**: Open `http://localhost:8080/interactive-windmill.html`
2. **Navigate**: Use mouse to orbit around the windmill
3. **Interact**: Use parameter sliders in the right panel
4. **Monitor**: Watch real-time performance metrics
5. **Experiment**: Try different scenario presets

### VR Experience (Oculus Quest)
1. **Connect**: Ensure Quest is on same Wi-Fi network
2. **Launch**: Open Oculus Browser
3. **Navigate**: Go to `http://[YOUR_PC_IP]:8080/interactive-windmill.html`
4. **Enter VR**: Click "🥽 Enter VR" button
5. **Interact**: Use hand controllers to navigate

### Finding Your PC IP Address
```bash
# Windows
ipconfig | findstr IPv4

# macOS/Linux
ifconfig | grep inet
```

## 🎛️ Parameter Reference

### Wind Conditions
| Parameter | Range | Impact | Description |
|-----------|-------|---------|-------------|
| **Wind Speed** | 0-30 m/s | Power output, blade RPM | Primary driver of turbine performance |
| **Wind Direction** | -180° to 180° | Nacelle yaw, wake effects | Affects wind shadow and yaw control |
| **Turbulence** | 0-50% | Particle chaos, efficiency | Creates realistic wind variability |

### Turbine Control
| Parameter | Range | Impact | Description |
|-----------|-------|---------|-------------|
| **Blade Pitch** | -5° to 35° | Power regulation, RPM | Controls aerodynamic efficiency |
| **Nacelle Yaw** | -180° to 180° | Wind tracking | Optimizes wind capture angle |
| **Generator Load** | 0-120% | Power output | Electrical load simulation |

### PINN Settings
| Parameter | Range | Impact | Description |
|-----------|-------|---------|-------------|
| **Learning Rate** | 0.0001-0.01 | Training speed | Neural network adaptation rate |
| **Physics Weight** | 0.1-5.0 | Physics compliance | Constraint strength in loss function |

## 🧪 Experimentation Guide

### Scenario Testing
1. **Start with "Optimal Conditions"** to see peak performance
2. **Switch to "Storm Conditions"** to observe safety responses
3. **Try "High Turbulence"** to see PINN adaptation
4. **Use "Maintenance Mode"** for shutdown procedures

### Parameter Exploration
1. **Wind Speed vs Power**: Observe cubic relationship at low speeds
2. **Blade Pitch Impact**: See power regulation at high wind speeds
3. **Turbulence Effects**: Watch particle behavior and efficiency drops
4. **PINN Learning**: Adjust learning rate to see prediction changes

### Performance Optimization
1. **Tip Speed Ratio**: Aim for 7-8 for optimal efficiency
2. **Pitch Control**: Use higher pitch in strong winds
3. **Yaw Alignment**: Keep nacelle facing wind direction
4. **Load Management**: Balance electrical load with wind conditions

## 🔧 Troubleshooting

### Common Issues

#### Application Won't Load
```bash
# Check if server is running
netstat -an | findstr :8080

# Try different port
python -m http.server 8081
```

#### Performance Issues
- **Reduce particle count**: Edit `particleCount = 5000` to lower value
- **Disable shadows**: Set `renderer.shadowMap.enabled = false`
- **Lower quality**: Reduce `renderer.setPixelRatio(1)`

#### VR Not Working
1. **Check WebXR support**: Visit https://immersiveweb.dev/
2. **Enable VR**: Chrome flags: `chrome://flags/#webxr-incubations`
3. **Network issues**: Ensure same Wi-Fi network
4. **Browser compatibility**: Use latest Oculus Browser

#### PINN Errors
- **TensorFlow.js fails**: Check console for loading errors
- **Memory issues**: Reduce model complexity
- **Training fails**: Lower learning rate or batch size

### Debug Mode
Add `?debug=1` to URL for additional console logging:
```
http://localhost:8080/interactive-windmill.html?debug=1
```

## 📱 Mobile Support

### Responsive Design
- Automatic panel resizing for smaller screens
- Touch-friendly controls
- Optimized performance for mobile GPUs

### Mobile VR
- Compatible with mobile VR headsets
- Cardboard and Daydream support
- Reduced particle count for better performance

## 🔬 Technical Details

### PINN Implementation
```javascript
// Neural network architecture
const pinnModel = tf.sequential({
    layers: [
        tf.layers.dense({ inputShape: [5], units: 64, activation: 'tanh' }),  // Input: x,y,z,t,windSpeed
        tf.layers.dense({ units: 128, activation: 'tanh' }),                 // Hidden layer 1
        tf.layers.dense({ units: 128, activation: 'tanh' }),                 // Hidden layer 2
        tf.layers.dense({ units: 64, activation: 'tanh' }),                  // Hidden layer 3
        tf.layers.dense({ units: 4, activation: 'linear' })                  // Output: vx,vy,vz,pressure
    ]
});
```

### Physics Equations
- **Continuity Equation**: ∇·v = 0 (mass conservation)
- **Navier-Stokes**: ∂v/∂t + (v·∇)v = -∇p/ρ + ν∇²v (momentum conservation)
- **Power Curve**: P = ½ρAv³Cp (wind power extraction)

### Performance Metrics
- **Render Loop**: 60 FPS target
- **Particle System**: 5000 particles with real-time physics
- **Memory Usage**: ~200MB for full experience
- **Network**: No external data after initial load

## 🤝 Contributing

### Development Setup
1. Fork this repository
2. Make changes to HTML/CSS/JavaScript
3. Test thoroughly across different browsers
4. Submit pull request with detailed description

### Adding Features
- **New Scenarios**: Add to `SCENARIOS` object
- **Parameters**: Extend `params` object and add UI controls  
- **Visualizations**: Modify particle systems or add new effects
- **PINN Models**: Experiment with different architectures

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 Roadmap

### Upcoming Features
- [ ] **Multi-turbine farms** with wake interactions
- [ ] **Weather API integration** for real-world conditions
- [ ] **Advanced PINN architectures** (ResNet, Transformer)
- [ ] **Predictive maintenance** algorithms
- [ ] **Performance comparison** tools
- [ ] **Export/import** parameter configurations

### Research Applications
- Wind farm optimization studies
- Turbine design validation
- Control system testing
- Educational demonstrations
- Research presentations

## 📞 Support

### Documentation
- **Three.js**: https://threejs.org/docs/
- **TensorFlow.js**: https://www.tensorflow.org/js
- **WebXR**: https://developer.mozilla.org/docs/Web/API/WebXR_Device_API

### Community
- Create issues for bugs or feature requests
- Discussion forum for questions and ideas
- Share your experimental results

---

**Built with ❤️ for the renewable energy and AI communities**

*Experience the future of wind energy through interactive physics-informed machine learning!*