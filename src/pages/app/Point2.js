import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import axios from "axios";
import util from "../../config/util";
import { enum_api_uri } from "../../config/enum";
import { appPointPop } from "../../store/popupSlice";
import ConfirmPop from "../../components/popup/ConfirmPop";
import pay_check_img from "../../images/app/pay_check_img.svg";


const Point2 = () => {
    const dispatch = useDispatch();
    const popup = useSelector((state)=>state.popup);
    const m_pay_check = enum_api_uri.m_pay_check;
    const [confirm, setConfirm] = useState(false);
    const token = util.getCookie("token");
    const checkDataStr = util.getCookie("checkData");
    const [complete, setComplete] = useState(false);


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);


    //결제처리 체크하기
    const payCheckHandler = () => {
        if(checkDataStr){
            const checkData = JSON.parse(checkDataStr);

            axios.get(`${m_pay_check.replace(":var1",checkData.var1)}`,
                {headers:{Authorization: `Bearer ${token}`}}
            )
            .then((res)=>{
                if(res.status === 200){
                    if(res.data.result){

                        // 포인트충전완료 팝업 띄우기
                        let payType;

                        if(checkData.pay == "card"){
                            payType = "신용카드";
                        }else if(checkData.pay == "phone"){
                            payType = "휴대폰결제";
                        }

                        const data = {
                            data: moment().format("YYYY.MM.DD"),
                            payType: payType,
                            price: checkData.price,
                            point: checkData.point
                        };
                        dispatch(appPointPop({appPointPop:true,appPointPopData:data}));

                        setComplete(true);
                    }
                }
            })
            .catch((error) => {

            });
        }
    };


    //0.3초마다 결제처리 체크하기
    useEffect(()=>{
        const timer = setInterval(() => {
            payCheckHandler();
        }, 300);

        return () => {
            clearInterval(timer);
        };
    },[]);


    //결제완료후 확인버튼 클릭시
    const payOkBtnClickHandler = () => {
        //앱에 포인트결제완료 보내기
        window.flutter_inappwebview.callHandler('flutterPointChargeComplete');
    };


    return(<>
        <div className="point_wrap2 flex_center">
            <div className="box tx_c">
                <img src={pay_check_img} alt="결제아이콘" />
                <p>결제가 {complete ? '완료되었습니다.' : '진행중 입니다.'}</p>
                {complete && <button type="button" className="app_btn" onClick={payOkBtnClickHandler}>확인</button>}
            </div>
        </div>

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}  
    </>);
};

export default Point2;