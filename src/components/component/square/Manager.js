import * as CF from "../../../config/function";
import manager_tag from '../../../images/manager_tag.svg';
import manager_tag_c from '../../../images/manager_tag_c.svg';


const Manager = ({data, likeBtnClickHandler, managerClickHandler}) => {
    return(
        <div className="feed_box manager">
            <div className="img_box" onClick={()=>managerClickHandler(data.manager_id)}>
                <img src={data.photo} alt="피드이미지" />
                <div className="box flex_center">
                    <p className="txt_feed">{CF.MakeIntComma(data.feed_cnt)}</p>
                    <p className="txt_like">{CF.MakeIntComma(data.fv_cnt)}</p>
                </div>
                <div className={`manager_tag flex${data.manager_type == 'C' ? ' charming' : ''}`}>
                    <img src={data.manager_type == 'C' ? manager_tag_c : manager_tag} alt="매니저타입 아이콘" />
                    <p>{data.manager_type == 'C' ? '챠밍 매니저' : 'VIP 매니저'}</p>
                </div>
            </div>
            <div className="txt_box">
                <div className="name">
                    <p>{data.manager_name}</p>
                </div>
                <p className="ellipsis">{data.txt}</p>
                <button type="button" 
                    className={`btn_like${data.fv_flag ? ' on' : ''}`}
                    onClick={()=>{likeBtnClickHandler(data.manager_id)}}
                >좋아요 버튼</button>
            </div>
        </div>
    );
};

export default Manager;