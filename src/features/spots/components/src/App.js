import { useState,useRef } from "react";
import "./App.css";
import { MdDirectionsWalk } from "react-icons/md";
import { MdOutlineHelpOutline } from "react-icons/md";
import { MdOutlineLocationOn } from "react-icons/md";
import { MdOutlineAccountCircle } from "react-icons/md";
import { MdOutlineAssignment } from "react-icons/md";
import { MdOutlineClear } from "react-icons/md";

function App() {
  return(
  <>
    {/* <button class="詳細を表示" onClick={スワイプで動く}></button> */}

    <div className="bottom-sheet">
      <button className="buttonArea" >
        <div className="handle"/>
      </button>

      <div className="header">
        <h1 className="title">スポットスポットスポットスポットスポット</h1>
        <button className="close-btn"><MdOutlineClear className="icon-info"/></button>
      </div>

      <div className="icons-row">
        <div className="icon-item">
          <MdDirectionsWalk className="icon"/>
          <div>nkm<br />n分</div>
        </div>
        <div className="icon-item">
          <MdOutlineHelpOutline className="icon"/>
          <div>未訪問</div>
        </div>
      </div>

      <div className="info">
        <div className="row">
          <MdOutlineLocationOn className="icon-info"/>
          <div className="text">
            〒012-3456 ◯◯県◯◯市◯◯町◯◯123
          </div>
        </div>
        <div className="row">
          <MdOutlineAccountCircle className="icon-info"/>
          <div className="text">
            hogehoge
          </div>
        </div>
        <div className="row" >
          <MdOutlineAssignment className="icon-info"/>
          <div className="text">
          hogehogehogehogehogehogehogehogehogehogehogehoge
          </div>
        </div>
        <button>写真を見る</button>
        <div className="img"></div>
      </div>
    </div>

  </>
)
}

export default App;
