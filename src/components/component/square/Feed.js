import * as CF from "../../../config/function";

const Feed = ({data, likeBtnClickHandler, feedClickHandler, myFeed}) => {
    return(
        <div className="feed_box">
            <div className="img_box" onClick={()=>feedClickHandler(data.idx)}>
                <img src={data.photo} alt="피드이미지" />
                <div className="box flex_center">
                    <p className="txt_comment">{CF.MakeIntComma(data.comment_cnt)}</p>
                    <p className="txt_like">{CF.MakeIntComma(data.fv_cnt)}</p>
                </div>
            </div>
            <div className="txt_box">
                {!myFeed &&
                    <div className={`name flex${data.manager_type == 'C' ? ' charming' : ''}`}>
                        <div className="img">
                            <img src={data.photo} alt="프로필이미지" />
                        </div>
                        <p>{data.manager_name}</p>
                    </div>
                }
                <p className="ellipsis2">{data.txt}</p>
                <p className="date">{data.w_date}</p>
                <button type="button" 
                    className={`btn_like${data.fv_flag ? ' on' : ''}`}
                    onClick={()=>{likeBtnClickHandler(data.idx)}}
                >좋아요 버튼</button>
            </div>
        </div>
    );
};

export default Feed;