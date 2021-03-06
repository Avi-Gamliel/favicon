import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'
import { BsFillTrash2Fill, BsCircleFill, BsFillSquareFill, BsBrush } from 'react-icons/bs';
import { BiMinus, BiEraser } from 'react-icons/bi';
import { IoIosUndo, IoMdArrowDropdown } from 'react-icons/io';
import './App.css';

const TYPES = ["128x128", "64x64", "32x32"]
const CODEC = ['png', 'jpeg', 'jpg', 'ico']
// st TYPES = [
//   {type:"128", choose:false},
//   {type:"64", choose:false},
//   {type:"32", choose:false},
//   {type:"16", choose:false},
// ]

const Option = ({ val, setVal, setToggle }) => {
  return (
    <div style={{ height: 40 }}
      onClick={() => {
        setVal(val)
        setToggle(false)
      }
      }
    >{val}</div>
  )
}

const Select = ({ data, value, setValue }) => {
  const [val, setVal] = useState(value)
  const [toggle, setToggle] = useState(false)

  return (
    <div>
      <div
        onClick={() => setToggle(prev => !prev)}
        style={{ background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 5, paddingRight: 5, width: 100, height: 40 }}>{value}<IoMdArrowDropdown color='black' size={25} /></div>
      {toggle &&
        <div style={{ position: 'absolute', paddingTop: 5, paddingRight: 5, paddingLeft: 5, width: 100, background: 'white', display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
          {data.map((d, i) => <Option setVal={setValue} setToggle={setToggle} val={d} key={i} index={i} />)}
        </div>

      }
    </div>

  )
}

const NavBar = ({ setType, codec, resolution, setResolution, setCodec, setColor, colorRef, color, ctx, bgColor, setBgColor, setSize, size }) => {
  // const [size, setSize] = useState(15)
  const onErase = (ctx) => {
    ctx.current.globalCompositeOperation = 'destination-out'
    setColor('#FFF')
  }

  return (
    <div className='nav-bar-container'>
      <div className='full-flex'>
        <IoIosUndo color='black' size={25} className='icon' />
        <BsFillTrash2Fill color='black' size={25} className='icon' />
        <BiEraser
          color='black'
          size={25}
          className='icon'
          onClick={(e) => {
            setType('erase')
            setColor(colorRef.current.value)
            onErase(ctx)
          }}
        />
        <BsFillSquareFill color='black' size={25} className='icon'
          onClick={() => setType('rect')} />
        <BsCircleFill color='black' size={25} className='icon'
        onClick={()=>setType('circle')} />
        <BiMinus color='black' size={35} className='icon stroke'
          onClick={() => setType('stroke')} />
        <input type="color"
          className="color-picker"
          ref={colorRef}
          value={color} onChangeCapture={(e) => setColor(e.target.value)} />
        <BsBrush
          onClick={() => setType('brush')}
          color='black' size={25} className='icon' />
        <label for='slider' style={{ color: 'white', minWidth: 30 }}>{size}</label>
        <input id='slider' type="range" min="0" max="50"
          className="slider"
          //  value={props.size}
          defaultValue={size}
          onChange={(e) => setSize(e.target.value)}
          onMouseUp={(e) => setSize(e.target.value)}
        />
      </div>
      <div className='full-flex'>
        <Select data={TYPES} setValue={setResolution} value={resolution} />
        <Select data={CODEC} setValue={setCodec} value={codec} />

        <input type="color"
          className="color-picker"
          ref={colorRef}
          value={bgColor} onChangeCapture={(e) => setBgColor(prev => e.target.value)} />
        <h3 className='logo'>FV</h3>


      </div>
    </div>
  )
}

// const Box = ({ type }) => {
//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 5, paddingRight: 5 }}>
//       <label htmlFor={type}>{type}x{type}</label>
//       <input type='checkbox' id={type} />
//     </div>
//   )
// }

// const CheckBox = () => {
//   return (
//     <div style={{ display: 'flex', justifyContent: 'center' }}>
//       {TYPES.map((t, i) => <Box key={i} type={t} />)}
//     </div>
//   );
// }

function App() {
  const colorRef = useRef()
  const canvasRef = useRef()
  const height = window.innerHeight
  const width = window.innerWidth
  const [path, setPath] = useState([])
  const [paths, setPaths] = useState([])
  const [type, setType] = useState('brush')
  const [color, setColor] = useState('#252525')
  const [size, setSize] = useState(10)
  const [pathsImages, setPathsImages] = useState([])
  const [drawing, setDrawing] = useState()
  const [startStrokeState, setStartStroke] = useState({ x: 0, y: 0 })
  const [camera, setCamera] = useState({ scale: 0 })
  const [bgColor, setBgColor] = useState('#fafafa')
  const [last, setLast] = useState({
    x: width / 2,
    y: height / 2
  })
  const ctx = useRef()
  const [elements, setElements] = useState([]);
  const [rects, setRect] = useState([])
  const [codec, setCodec] = useState('jpeg')
  const [resolution, setResolution] = useState('32x32')
  const [imageDownload, setImageDownload] = useState(null)
  useLayoutEffect(() => {

    const canvas = canvasRef.current;
    canvas.width = 300; canvas.height = 300;
    ctx.current = canvas.getContext('2d');
    // ctx.current.fillStyle = bgColor;
    // ctx.current.fillRect(0, 0, canvas.width, canvas.height);

    trackTransforms(ctx.current);
    // ctx.current.fillStyle = "blue";

    redraw();

    function trackTransforms(ctx) {
      var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
      var xform = svg.createSVGMatrix();
      ctx.getTransform = function () { return xform; };

      var savedTransforms = [];
      var save = ctx.save;
      ctx.save = function () {
        savedTransforms.push(xform.translate(0, 0));
        return save.call(ctx);
      };
      var restore = ctx.restore;
      ctx.restore = function () {
        xform = savedTransforms.pop();
        return restore.call(ctx);
      };

      var scale = ctx.scale;
      ctx.scale = function (sx, sy) {
        xform = xform.scaleNonUniform(sx, sy);
        return scale.call(ctx, sx, sy);
      };
      var rotate = ctx.rotate;
      ctx.rotate = function (radians) {
        xform = xform.rotate(radians * 180 / Math.PI);
        return rotate.call(ctx, radians);
      };
      var translate = ctx.translate;
      ctx.translate = function (dx, dy) {
        xform = xform.translate(dx, dy);
        return translate.call(ctx, dx, dy);
      };
      var transform = ctx.transform;
      ctx.transform = function (a, b, c, d, e, f) {
        var m2 = svg.createSVGMatrix();
        m2.a = a; m2.b = b; m2.c = c; m2.d = d; m2.e = e; m2.f = f;
        xform = xform.multiply(m2);
        return transform.call(ctx, a, b, c, d, e, f);
      };
      var setTransform = ctx.setTransform;
      ctx.setTransform = function (a, b, c, d, e, f) {
        xform.a = a;
        xform.b = b;
        xform.c = c;
        xform.d = d;
        xform.e = e;
        xform.f = f;
        return setTransform.call(ctx, a, b, c, d, e, f);
      };
      var pt = svg.createSVGPoint();
      ctx.transformedPoint = function (x, y) {
        pt.x = x; pt.y = y;
        return pt.matrixTransform(xform.inverse());
      }
    }

  }, []);

  const onPaint = () => {
    ctx.current.globalCompositeOperation = 'source-over'
  }

  const startDrawing = (evt) => {

    let lastX = evt.offsetX || (evt.pageX - canvasRef.current.offsetLeft)
    let lastY = evt.offsetY || (evt.pageY - canvasRef.current.offsetTop);

    setLast(prev => {
      prev.x = lastX
      prev.y = lastY
      return prev
    })

    var pt = ctx.current.transformedPoint(lastX, lastY);

    setDrawing(true)
    if (type === 'brush') {
      ctx.current.beginPath()
      ctx.current.moveTo(pt.x, pt.x.y)
      // setPath((prev) => [{ id: paths.length, color: color, type: type, size: size, pos: [{ x: pt.x, y: pt.y }] }])
      setPaths(prev => [...prev, { id: paths.length, color: color, type: type, size: size, pos: [{ x: pt.x, y: pt.y }] }])

    } else if (type === 'eraser') {

    } else if (type === 'rect') {
   
      setPaths((prev) => [...prev, { id: paths.length, color: color, type: type, size: size, pos: [{ x1: lastX, y1: lastY, x2: lastX, y2: lastY }] }])

    } else if (type === 'circle') {

      ctx.current.strokeStyle = color
      ctx.current.lineWidth = size
      ctx.current.fillStyle = color
      ctx.current.beginPath()
      // setPatha((prev) => [{ id: paths.length, color: color, type: type, size: size, pos: [{ x1: lastX, y1: lastY, x2: lastX, y2: lastY }] }])
      setPaths((prev) => [...prev, { id: paths.length, color: color, type: type, size: size, pos: [{ x1: lastX, y1: lastY, x2: lastX, y2: lastY }] }])

    } else if (type === 'stroke') {
      setPaths(prev => [...prev, { id: paths.length, color: color, type: type, size: size, pos: [{ x1: lastX, y1: lastY, x2: lastX, y2: lastY }] }])

      // setPath(prev => [{ id: paths.length, color: color, type: type, size: size, pos: [{ x1: lastX, y1: lastY, x2: lastX, y2: lastY }] }])
      // setPaths(prev=> [...prev, ])
    }
  }

  const onDraw = (evt) => {

    // let lastX = evt.offsetX || (evt.pageX - canvasRef.current.offsetLeft)
    // let lastY = evt.offsetY || (evt.pageY - canvasRef.current.offsetTop);
    const index = paths.length - 1; //last element of the array "elements"
    setLast(prev => {
      prev.x = evt.offsetX || (evt.pageX - canvasRef.current.offsetLeft);
      prev.y = evt.offsetY || (evt.pageY - canvasRef.current.offsetTop);
      return prev
    })

    if (!drawing) return;
    let pos;
    var pt = ctx.current.transformedPoint(last.x, last.y);

    if (type === 'brush') {
      pos = { x: pt.x, y: pt.y }
      setPaths((prev) => {
        const temp = prev[prev.length - 1].pos
        prev[prev.length - 1].pos = [...temp, { x: pt.x, y: pt.y }]
        return [...prev]
      })
    } else {
      const { x1, y1, x2, y2 } = paths[paths.length - 1].pos[0];
      if (type === 'eraser') {

      } else if (type === 'rect') {
        pos = [{ x1, y1, x2: last.x, y2: last.y }]
      } else if (type === 'circle') {
        // ctx.current.fillRect(x1, y1, last.x, last.y);
        // ctx.current.stroke();
        pos = [{ x1, y1, x2: last.x, y2: last.y }]

      } else if (type === 'stroke') {
        pos = [{ x1, y1, x2: last.x, y2: last.y }]
      }

      setPaths(prev => {
        prev[prev.length - 1].pos = pos
        return [...prev];
      })
    }
  }

  const endDrawing = () => {
    ctx.current.closePath()
    setDrawing(false)
    setPath([])
  }

  const onMouseLeave = (e) => {
    // setDrawing(false)
  }


  const drawGuideLines = () => {
    ctx.current.beginPath()
    ctx.current.strokeStyle = 'rgba(0,0,0,0.050)'
    ctx.current.lineWidth = 3


    for (let i = 0; i < 500; i += 50) {

      ctx.current.moveTo(i, 0);
      ctx.current.lineTo(i, 500);
      ctx.current.moveTo(0, i);
      ctx.current.lineTo(500, i);
    }
    ctx.current.stroke();
    ctx.current.closePath()

  }

  function redraw() {


    // function roundRect(x, y, w, h, radius)
    // {

    //   // console.log(x,y,w,h,radius)
    //   var r = x + w;
    //   var b = y + h;
    //   ctx.current.beginPath();
    //   ctx.current.fillStyle = color
    //   ctx.current.strokeStyle=color;
    //   ctx.current.lineWidth="4";
    //   ctx.current.moveTo(x+radius, y);
    //   ctx.current.lineTo(r-radius, y);
    //   ctx.current.quadraticCurveTo(r, y, r, y+radius);
    //   ctx.current.lineTo(r, y+h-radius);
    //   ctx.current.quadraticCurveTo(r, b, r-radius, b);
    //   ctx.current.lineTo(x+radius, b);
    //   ctx.current.quadraticCurveTo(x, b, x, b-radius);
    //   ctx.current.lineTo(x, y+radius);
    //   ctx.current.quadraticCurveTo(x, y, x+radius, y);
    //   ctx.current.stroke();
    // }
    // roundRect(10, 10, 200, 100,10); // position x || position y || w : position corsurx - position x start || h: positiony - position y start || radius 

// function RectWithRadius(){
//   ctx.current.strokeStyle = p.color
//   ctx.current.lineWidth = p.size
//   ctx.current.fillStyle = p.color
//   ctx.current.fillRect(p.pos[0].x1, p.pos[0].y1, p.pos[0].x2 - p.pos[0].x1, p.pos[0].y2 - p.pos[0].y1);
//   ctx.current.stroke();
//   ctx.current.closePath()


// }

    var p1 = ctx.current.transformedPoint(0, 0);
    // drawGuideLines()
    if (paths.length > 0) {
      ctx.current.fillStyle = bgColor
      ctx.current.lineCap = "round"
      ctx.current.lineJoin = "round"
      ctx.current.fillRect(0, 0, ctx.current.canvas.width, ctx.current.canvas.height);
      paths.forEach(p => {
        ctx.current.beginPath()
        if (p.type == 'rect') {
          ctx.current.strokeStyle = p.color
          ctx.current.lineWidth = p.size
          ctx.current.fillStyle = p.color
    // roundRect(p.pos[0].x1, p.pos[0].y1,  p.pos[0].x2 - p.pos[0].x1, p.pos[0].y2 - p.pos[0].y1,0); // position x || position y || w : position corsurx - position x start || h: positiony - position y start || radius 

          ctx.current.fillRect(p.pos[0].x1, p.pos[0].y1,p.pos[0].x2 - p.pos[0].x1, p.pos[0].y2 - p.pos[0].y1);
          ctx.current.stroke();
          ctx.current.closePath()
        } else if (p.type == 'circle') {
          
          ctx.current.strokeStyle = p.color
          ctx.current.lineWidth = p.size
          ctx.current.fillStyle = p.color
          ctx.current.fillStyle = 'red';
ctx.current.beginPath();
ctx.current.ellipse(p.pos[0].x1 + ((p.pos[0].x2 - p.pos[0].x1)/2), p.pos[0].y1 +((p.pos[0].y2 - p.pos[0].y1)/2), (p.pos[0].x2-p.pos[0].x1<0 ? -1*(p.pos[0].x2-p.pos[0].x1):p.pos[0].x2-p.pos[0].x1),p.pos[0].y2-p.pos[0].y1<0? -1*(p.pos[0].y2-p.pos[0].y1):(p.pos[0].y2-p.pos[0].y1), 0, 0, 2 * Math.PI);
ctx.current.fill();
          // ctx.current.fillRect(p.pos.x1, p.pos.y1, p.pos.x2 - p.pos.x1, p.pos.y2 - p.pos.y1);
          // ctx.current.stroke();
          ctx.current.closePath()
        } else if (p.type == 'stroke') {
          ctx.current.strokeStyle = p.color
          ctx.current.lineWidth = p.size
          ctx.current.moveTo(p.pos[0].x1, p.pos[0].y1)
          ctx.current.lineTo(p.pos[0].x2, p.pos[0].y2)
          ctx.current.stroke();
          ctx.current.closePath()
        } else if (p.type == 'brush') {
          for (let i = 0; i < p.pos.length - 1; i++) {
            if (p.pos[i + 1] !== undefined) {
              ctx.current.strokeStyle = p.color
              ctx.current.lineWidth = p.size
              ctx.current.moveTo(p.pos[i].x, p.pos[i].y)
              ctx.current.lineTo(p.pos[i + 1].x, p.pos[i + 1].y)
              ctx.current.stroke()
            }
          }
          ctx.current.closePath()
        }

      })
    }

  }

  useEffect(() => {
    redraw()
    var image = new Image()
    var img = ctx.current.canvas.toDataURL("image/jpeg");
    image.src = img
    const fav = document.getElementById('favicon');
    fav.href = img
    fav.href = img
  }, [bgColor, elements, rects, paths])
  useEffect(() => {
    ctx.current.lineCap = "round"
    ctx.current.lineJoin = "round"
    ctx.current.strokeStyle = color
    ctx.current.lineWidth = size
  }, [color, size])


  const downlaod_img = (el) => {
    // get image URI from canvas object
    //  var imageURI = ctx.current.canvas.toDataURL("image/jpg");
    //  el.href = imageURI;
    var image = new Image()
    var img = ctx.current.canvas.toDataURL();
    const a = document.createElement('a')
    a.href = img;
    a.download = `favicon.${codec}`;
    a.click();
    // // // if(img){
    //   var img    = ctx.current.canvas.toDataURL("image/png");
    //     image.src = img
    // setImageDownload(image)
    // document.write('<img src="'+img+'"/>');

    // // }
    // document.write('<img src="'+img+'"/>');
  }
  return (
    <div className="App">
      <NavBar setType={setType}
        setColor={setColor}
        colorRef={colorRef}
        ctx={ctx}
        color={color}
        bgColor={bgColor}
        setBgColor={setBgColor}
        setSize={setSize}
        size={size}
        setCodec={setCodec}
        setResolution={setResolution}
        codec={codec}
        resolution={resolution}
      />
      <h1> FAVICION EASLY </h1>
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={onDraw}
        onMouseUp={endDrawing}
        onMouseLeave={(e) => onMouseLeave(e)}
      >


      </canvas>
      <div id="download" onClick={() => {
        downlaod_img()
      }}>download</div>
    </div>
  );
}

export default App;
