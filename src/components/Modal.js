import './style.css';

function Modal({children, disp, setDisp}) {

  return (
    <div className="modal" style={{display: disp}}>
      <p className="close" onClick={()=>{setDisp("none")}}>x</p>
      {children}
    </div>
  );
}

export default Modal;
