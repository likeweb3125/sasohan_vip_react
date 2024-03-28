import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDropzone } from 'react-dropzone';
import axios from "axios";
import * as CF from "../../config/function";
import { enum_api_uri } from "../../config/enum";
import { feedAddPop, confirmPop } from "../../store/popupSlice";
import TextareaBox from "../component/TextareaBox";
import ConfirmPop from "./ConfirmPop";


const FeedAddPop = () => {
    const dispatch = useDispatch();
    const user = useSelector((state)=>state.user);
    const popup = useSelector((state)=>state.popup);
    const api_uri = enum_api_uri.api_uri;
    const feed_content = enum_api_uri.feed_content;
    const feed_img = enum_api_uri.feed_img;
    const feed_img_delt = enum_api_uri.feed_img_delt;
    const feed_add = enum_api_uri.feed_add;
    const feed_modify = enum_api_uri.feed_modify;
    const [confirm, setConfirm] = useState(false);
    const [feedAddOkconfirm, setFeedAddOkConfirm] = useState(false);
    const [imgNameList, setImgNameList] = useState([]);
    const [imgList, setImgList] = useState([]);
    const [content, setContent] = useState('');


    // Confirm팝업 닫힐때
    useEffect(()=>{ 
        if(popup.confirmPop === false){
            setConfirm(false);
            setFeedAddOkConfirm(false);
        }
    },[popup.confirmPop]);
 

    //팝업닫기
    const closePopHandler = () => {
        dispatch(feedAddPop({feedAddPop:false,feedAddPopNo:null}));
    };


    //피드내용 가져오기
    const getFeed = () => {
        axios.get(`${feed_content.replace(":idx",popup.feedAddPopNo)}`)
        .then((res)=>{
            if(res.status === 200){
                const data = res.data;
                setImgList([...data.photo]);
                setContent(data.txt);
            }
        })
        .catch((error) => {
            const err_msg = CF.errorMsgHandler(error);
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt: err_msg,
                confirmPopBtn:1,
            }));
            setConfirm(true);
        });
    };


    //피드 수정일때 피드내용 가져오기
    useEffect(()=>{
        if(popup.feedAddPopNo){
            getFeed();
        }
    },[popup.feedAddPopNo]);


    //이미지 첨부-----------------------------------------
    //피드 이미지 등록
    const { getRootProps: getRootProps1, getInputProps: getInputProps1 } = useDropzone({
        accept: {
            'image/*': []
        },
        multiple: true, // 여러 개의 파일 선택 가능하도록 설정
        onDrop: acceptedFiles => {
            const files = acceptedFiles.length + imgList.length;

            if(acceptedFiles.length === 0){
                return;
            }else if(files > 6){
                dispatch(confirmPop({
                    confirmPop:true,
                    confirmPopTit:'알림',
                    confirmPopTxt:'이미지는 최대 6개까지 첨부 가능합니다.',
                    confirmPopBtn:1,
                }));
                setConfirm(true);
            }else{
                const formData = new FormData();
                acceptedFiles.forEach((item)=>{
                    formData.append("media", item);
                });
                
                axios.post(feed_img, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${user.userToken}`,
                    },
                })
                .then((res) => {
                    if (res.status === 201) {
                        const mediaUrls = res.data.mediaUrls;
                        const newList = [...imgList, ...mediaUrls];
                        setImgList(newList);
                    }
                })
                .catch((error) => {
                    const err_msg = CF.errorMsgHandler(error);
                    dispatch(confirmPop({
                        confirmPop:true,
                        confirmPopTit:'알림',
                        confirmPopTxt: err_msg,
                        confirmPopBtn:1,
                    }));
                    setConfirm(true);
                });
            }
        }
    });


    //피드 이미지 삭제
    const handleRemove = (idx, url) => {
        const filename = url.substring(url.lastIndexOf('/') + 1);

        axios.delete(feed_img_delt.replace(':filename',filename),{
            headers: {
                Authorization: `Bearer ${user.userToken}`,
            },
        })
        .then((res)=>{
            if(res.status === 200){
                let newList = [...imgList];
                newList.splice(idx,1);
                setImgList(newList);
            }
        })
        .catch((error) => {
            const err_msg = CF.errorMsgHandler(error);
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt: err_msg,
                confirmPopBtn:1,
            }));
            setConfirm(true);
        });

    };


    //피드 이미지 미리보기 생성
    const feedImgs = imgList.map((url,i) => (
        <li key={i}>
            <img
                src={url}
                alt="이미지"
            />
            <button className="btn_delt" onClick={() => handleRemove(i, url)}>삭제버튼</button>
        </li>
    ));


    //프로필사진 이미지이름만 배열로 
    useEffect(()=>{
        const newNameList = imgList.map(url => {
            let updatedUrl = url.replace(api_uri+"/upload/profile/manager/", "");
            return updatedUrl;
        });
        setImgNameList(newNameList);
    },[imgList]);
    //이미지 첨부-----------------------------------------


    //피드등록, 수정버튼 클릭시
    const feedAddBtnClickHandler =() => {
        if(imgList.length === 0){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'피드 이미지를 등록해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }else if(content.length === 0){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'피드 내용을 입력해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }else{
            //새로등록일때
            if(popup.feedAddPopNo === null){
                feedAddHandler();
            }
            //수정일때
            else{
                feedEditHandler();
            }
        }

        
    };


    //피드 새로등록하기
    const feedAddHandler = () => {
        const body = {
            photo: imgNameList,
            content: content
        };
        axios.post(feed_add, body, {
            headers: {
                Authorization: `Bearer ${user.userToken}`,
            },
        })
        .then((res) => {
            if (res.status === 200) {
                dispatch(confirmPop({
                    confirmPop:true,
                    confirmPopTit:'알림',
                    confirmPopTxt:'피드를 등록했습니다.',
                    confirmPopBtn:1,
                }));
                setFeedAddOkConfirm(true);
            }
        })
        .catch((error) => {
            const err_msg = CF.errorMsgHandler(error);
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt: err_msg,
                confirmPopBtn:1,
            }));
            setConfirm(true);
        });
    };


    //피드 수정하기
    const feedEditHandler = () => {
        const body = {
            idx: popup.feedAddPopNo,
            photo: imgNameList,
            content: content
        };
        axios.put(feed_modify, body, {
            headers: {
                Authorization: `Bearer ${user.userToken}`,
            },
        })
        .then((res) => {
            if (res.status === 200) {
                dispatch(confirmPop({
                    confirmPop:true,
                    confirmPopTit:'알림',
                    confirmPopTxt:'피드를 수정했습니다.',
                    confirmPopBtn:1,
                }));
                setFeedAddOkConfirm(true);
            }
        })
        .catch((error) => {
            const err_msg = CF.errorMsgHandler(error);
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt: err_msg,
                confirmPopBtn:1,
            }));
            setConfirm(true);
        });
    };



    return(<>
        <div className="flex_center pop_wrap feed_add_pop">
            <div className="dim"></div>
            <div className="pop_cont">
                <button type="button" className="btn_close black" onClick={closePopHandler}>닫기버튼</button>
                <div className="pop_tit">
                    <div className="tit">피드 업로드</div>
                </div>
                <div className="scroll_wrap">
                    <div className="bm16">
                        <p>피드 이미지 <span className="color_point">*</span></p>
                        <p className="f_14 color_gray tp10">이미지를 최소 <span className="color_point">1장</span> 등록해주세요. 6장까지 등록하실 수 있어요!</p>
                        <div className="img_drop_box">
                            <div {...getRootProps1({className: 'dropzone'})}>
                                <input {...getInputProps1()} />
                                <div className="txt_box tx_c">
                                    <div className="txt1">이미지 첨부</div>
                                    <p className="txt2">이미지를 드래그 앤 드롭하여 첨부하세요!<span>파일 업로드는 jpg, jpeg, png, gif 형식만 첨부 가능</span></p>
                                </div>
                            </div>
                            {feedImgs.length > 0 &&
                                <div className="img_list_box scroll_wrap_x">
                                    <ul className='flex tp12'>
                                        {feedImgs}
                                    </ul>
                                </div>
                            }
                        </div>
                    </div>
                    <div className="bm16">
                        <p className="bp12">내용 <span className="color_point">*</span></p>
                        <TextareaBox 
                            placeholder='피드 내용을 입력해주세요.'
                            value={content}
                            onChangeHandler={(e)=>{
                                const val = e.currentTarget.value;
                                setContent(val);
                            }}
                        />
                    </div>
                </div>
                <div className="btn_box flex_between">
                    <button type="button" className="btn_type4" onClick={closePopHandler}>취소</button>
                    <button type="button" className="btn_type3" onClick={feedAddBtnClickHandler}>{popup.feedAddPopNo === null ? '등록' : '수정'}</button>
                </div>
            </div>
        </div>

        {/* 피드등록 완료 confirm팝업 */}
        {feedAddOkconfirm && <ConfirmPop onClickHandler={closePopHandler}/>}

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default FeedAddPop;