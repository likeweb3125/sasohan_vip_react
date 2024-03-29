import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDropzone } from 'react-dropzone';
import axios from "axios";
import * as CF from "../../config/function";
import { enum_api_uri } from "../../config/enum";
import { vipApplyPop, confirmPop } from "../../store/popupSlice";
import InputBox from "../component/InputBox";
import ConfirmPop from "./ConfirmPop";
import sample_img from "../../images/sample/manager0.png";


const VipApplyPop = () => {
    const dispatch = useDispatch();
    const user = useSelector((state)=>state.user);
    const popup = useSelector((state)=>state.popup);
    const common = useSelector((state)=>state.common);
    const api_uri = enum_api_uri.api_uri;
    const vip_apply = enum_api_uri.vip_apply;
    const vip_apply_img = enum_api_uri.vip_apply_img;
    const vip_apply_img_delt = enum_api_uri.vip_apply_img_delt;
    const [confirm, setConfirm] = useState(false);
    const [values, setValues] = useState({});
    const [imgNameList, setImgNameList] = useState([]);
    const [imgList, setImgList] = useState([]);



    // Confirm팝업 닫힐때
    useEffect(()=>{ 
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);


    //팝업닫기
    const closePopHandler = () => {
        dispatch(vipApplyPop(false));
    };


    //input값 변경시
    const onInputChangeHandler = (e) => {
        let val = e.target.value;
        const id = e.target.id;

        const newValues = {...values};
        newValues[id] = val;
        setValues(newValues); 
    };


    //이미지 첨부-----------------------------------------
    // 프로필사진 등록
    const { getRootProps: getRootProps1, getInputProps: getInputProps1 } = useDropzone({
        accept: {
            'image/*': []
        },
        multiple: true, // 여러 개의 파일 선택 가능하도록 설정
        onDrop: acceptedFiles => {
            const files = acceptedFiles.length + imgList.length;

            if(acceptedFiles.length === 0){
                return;
            }else if(files > 3){
                dispatch(confirmPop({
                    confirmPop:true,
                    confirmPopTit:'알림',
                    confirmPopTxt:'프로필 사진은 최대 3개까지 첨부 가능합니다.',
                    confirmPopBtn:1,
                }));
                setConfirm(true);
            }else{
                const formData = new FormData();
                acceptedFiles.forEach((item)=>{
                    formData.append("media", item);
                });
                
                axios.post(vip_apply_img, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
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


    //프로필, 피드 이미지 삭제
    const handleRemove = (idx, url) => {
        const filename = url.substring(url.lastIndexOf('/') + 1);

        axios.delete(vip_apply_img_delt.replace(':filename',filename))
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

    
    // 프로필사진 미리보기 생성
    const profileImgs = imgList.map((url,i) => (
        <li key={i}>
            <img
                src={url}
                alt="이미지"
            />
            <button className="btn_delt" onClick={() => handleRemove(i, url, 'profile')}>삭제버튼</button>
        </li>
    ));


    //프로필사진 이미지이름만 배열로 
    useEffect(()=>{
        const newNameList = imgList.map(url => {
            let updatedUrl = url.replace(api_uri+"/upload/profile/user/", "");
            return updatedUrl;
        });
        setImgNameList(newNameList);
    },[imgList]);
    //이미지 첨부-----------------------------------------


    return(<>
        <div className="flex_center pop_wrap vip_apply_pop">
            <div className="dim"></div>
            <div className="pop_cont">
                <button type="button" className="btn_close" onClick={closePopHandler}>닫기버튼</button>
                <div className="apply_cont">
                    <div className="tit">사소한 VIP 회원 지원하기</div>
                    <div className="form_box scroll_wrap">
                        <ul className="form_ul">
                            <li>
                                <p>나이 <span className="color_point">*</span></p>
                                <div className="input_box">
                                    <InputBox 
                                        type={'text'}
                                        placeholder={`나이를 입력해주세요.`}
                                        value={values.age}
                                        onChangeHandler={onInputChangeHandler}
                                        id={`age`}
                                        numberOnly={true}
                                        countMax={3}
                                    />
                                </div>
                            </li>
                            <li>
                                <p>연락처 <span className="color_point">*</span></p>
                                <div className="input_box">
                                    <InputBox 
                                        type={'text'}
                                        placeholder={`숫자만 입력해주세요.`}
                                        value={values.phone}
                                        onChangeHandler={onInputChangeHandler}
                                        id={`phone`}
                                        phone={true}
                                    />
                                </div>
                            </li>
                            <li>
                                <p>정면사진 (3장 첨부 필수) <span className="color_point">*</span></p>
                                <div className="img_drop_box">
                                    <div {...getRootProps1({className: 'dropzone'})}>
                                        <input {...getInputProps1()} />
                                        <div className="txt_box tx_c">
                                            <div className="txt1">이미지 첨부</div>
                                            <p className="txt2">이미지를 드래그 앤 드롭하여 첨부하세요!<span>파일 업로드는 jpg, jpeg, png, gif 형식만 첨부 가능</span></p>
                                        </div>
                                    </div>
                                    {profileImgs.length > 0 &&
                                        <div className="img_list_box scroll_wrap_x">
                                            <ul className='flex tp12'>
                                                {profileImgs}
                                            </ul>
                                        </div>
                                    }
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default VipApplyPop;