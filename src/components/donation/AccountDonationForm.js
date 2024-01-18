import React, { useState, useEffect } from 'react'
import { donationApi, publicApi } from 'src/api/services'
import FormInput from '../forms/FormInput'
import { NavLink, useLocation } from 'react-router-dom'

import donateImg1 from '../../assets/images/donate-img1.jpg'
import donateImg2 from '../../assets/images/donate-img2.jpg'
import donateImg3 from '../../assets/images/donate-img3.jpg'
import donateImg4 from '../../assets/images/donate-img4.jpg'
import ErrorModal from '../modals/ErrorModal'
import { CFormSelect } from '@coreui/react'
import { DonationPurpose } from 'src/constants/DonationCode'
import useAuth from '../hooks/useAuth'
import accountService from 'src/api/services/accountService'
import LoadingModal from '../modals/LoadingModal'

const AccountDonationForm = () => {
  const { auth } = useAuth()
  const accountApi = accountService()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const programId = searchParams.get('programId')
  const familyparamId = searchParams.get('familyId')

  const [donor, setDonor] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: null,
    mail_address: '',
    phone_number: '',
    address: {
      province_id: null,
      district_id: null,
      ward_id: null,
      address_detail: '',
    },
  })

  const [donationPurposes, setDonationPurposes] = useState([])
  const [purposeId, setPurposeId] = useState(programId || DonationPurpose.default.code)

  const [families, setFamilies] = useState([])
  const [familyId, setFamilyId] = useState(familyparamId || '')

  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])

  const [message, setMessage] = useState('')

  const [amountIpState, setAmountIpState] = useState(false)
  const [amount, setAmount] = useState(300000)
  const [amountInvalid, setAmountInvalid] = useState(false)

  const [readOnlyState, setReadOnlyState] = useState(false)
  const [formValid, setFormValid] = useState(false)

  const [errormodalVisible, setErrorModalVisible] = useState(false)
  const [errorModalMessage, setErrorModalMessage] = useState({
    modalTile: '',
    modalContent: '',
  })

  const [loadingModalVisible, setLoadingModalVisible] = useState(false)

  useEffect(() => {
    const getAccountDonorInfo = async () => {
      try {
        const response = await accountApi.getAccountDonorInfo(auth?.userId)
        setDonor(response.result)
        setReadOnlyState(true)
      } catch (error) {
        console.log(error)
      }
    }
    auth?.userId && getAccountDonorInfo()
  }, [auth])

  useEffect(() => {
    let isValid = message && !amountInvalid
    setFormValid(isValid)
  }, [donor, amount, message, amountInvalid])

  useEffect(() => {
    // Get provinces
    const getProvinces = async () => {
      try {
        const response = await publicApi.getProvince()
        const result = response.result
        setProvinces(result)
      } catch (error) {
        console.log(error)
      }
    }
    // Get donation purposes
    const getDonatioPurposes = async () => {
      try {
        const response = await donationApi.getAllDonationPurposes()
        const result = response.result
        setDonationPurposes(result)
      } catch (error) {
        console.log(error)
      }
    }
    getDonatioPurposes()
    getProvinces()
  }, [])

  // Init districts select options
  useEffect(() => {
    if ((donor.address.province_id, provinces.length)) {
      const province = provinces.find(
        (province) => province.province_id == donor.address.province_id,
      )
      setDistricts(province.districts)
    }
  }, [donor.address.province_id, provinces, readOnlyState])

  // Init wards select options
  useEffect(() => {
    if (donor.address.district_id && districts.length) {
      const district = districts.find(
        (district) => district.district_id == donor.address.district_id,
      )
      setWards(district?.wards)
    }
  }, [donor.address.district_id, districts, readOnlyState])

  const handleAmountChange = (e) => {
    const value = e.target.value
    if (value >= 0) {
      setAmount(value)
      if (value > 100000) {
        setAmountInvalid(false)
      } else {
        setAmountInvalid(true)
      }
    } else {
      setAmountInvalid(true)
    }
  }

  useEffect(() => {
    const getFamilies = async () => {
      try {
        const response = await donationApi.getAllFamilies()
        const result = response.result
        console.log(result)
        setFamilies(result)
      } catch (error) {
        console.log(error)
      }
    }
    if (purposeId == 2 && families.length === 0) {
      getFamilies()
    } else {
      if (familyId) setFamilyId('')
    }
  }, [purposeId])

  const handlePurposeChange = (e) => {
    const value = e.target.value
    setPurposeId(value)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (donor?.is_first_time !== null) {
      setLoadingModalVisible(true)
      const data = {
        donor: donor,
        donation_purpose_id: purposeId,
        family_id: familyId,
        amount: amount,
        message: message,
        url_return: 'http://localhost:3001/donation/return',
      }
      try {
        if (donor?.is_first_time) {
          const response = await accountApi.accountAddNewDonation(auth.userId, JSON.stringify(data))
          setLoadingModalVisible(false)
          window.location.replace(response.result)
        } else {
          const response = await donationApi.donorDoDonate(donor.donor_id, JSON.stringify(data))
          setLoadingModalVisible(false)
          window.location.replace(response.result)
        }
      } catch (error) {
        setLoadingModalVisible(false)
        setErrorModalMessage((prevModalError) => ({
          ...prevModalError,
          modalTile: 'Lỗi',
          modalContent: 'Đã có lỗi xảy ra, vui lòng thử lại sau',
        }))
        setErrorModalVisible(true)
      }
    } else {
      setErrorModalMessage((prevModalError) => ({
        ...prevModalError,
        modalTile: 'Lỗi',
        modalContent: 'Đã có lỗi xảy ra, vui lòng thử lại sau',
      }))
      setErrorModalVisible(true)
    }
  }

  const inputs = [
    {
      type: 'text',
      id: 'inputdonorFirstName',
      label: 'Nhập tên*',
      name: 'first_name',
      value: donor.first_name,
    },
    {
      type: 'text',
      id: 'inputdonorLastName',
      label: 'Nhập họ và tên đệm*',
      name: 'last_name',
      value: donor.last_name,
    },
    {
      type: 'date',
      id: 'inputdonorDOB',
      label: 'Nhập ngày sinh*',
      name: 'date_of_birth',
      value: donor.date_of_birth,
    },
    {
      type: 'select',
      id: 'inputdonorGender',
      label: 'Chọn giới tính*',
      name: 'gender',
      value: donor.gender,

      options: [
        { label: 'Nam', value: 1 },
        { label: 'Nữ', value: 2 },
        { label: 'Khác', value: 0 },
      ],
    },
    {
      type: 'number',
      id: 'inputdonorPhone',
      label: 'Nhập số điện thoại*',
      name: 'phone_number',
      value: donor.phone_number,
    },
    {
      type: 'text',
      id: 'inputdonorEmail',
      label: 'Nhập địa chỉ email*',
      name: 'mail_address',
      value: donor.mail_address,
    },
    {
      type: 'select',
      id: 'inputProvinceId',
      label: 'Chọn Tỉnh/Thành phố*',
      name: 'province_id',
      value: donor.address.province_id,
      options: provinces.map((province) => ({
        label: province.province_name,
        value: province.province_id,
      })),
    },
    {
      type: 'select',
      id: 'inputDistrictId',
      label: 'Chọn Quận/Huyện*',
      name: 'district_id',
      value: donor.address.district_id,
      options: districts.map((district) => ({
        label: district.district_name,
        value: district.district_id,
      })),
    },
    {
      type: 'select',
      id: 'inputWardId',
      label: 'Chọn Phường/Xã*',
      name: 'ward_id',
      value: donor.address.ward_id,
      options: wards
        ? wards?.map((ward) => ({
            label: ward.ward_name,
            value: ward.ward_id,
          }))
        : [],
    },
    {
      type: 'text',
      id: 'inputAddressDetail',
      label: 'Địa chỉ chi tiết',
      name: 'address_detail',
      value: donor.address.address_detail,
    },
  ]
  return (
    <>
      <LoadingModal isVisible={loadingModalVisible} setVisible={setLoadingModalVisible} />
      <ErrorModal
        modalMessage={errorModalMessage}
        isVisible={errormodalVisible}
        setVisible={setErrorModalVisible}
      />
      <section className="contact-form-area register-area pt-5">
        <div className="container">
          <div className="row form-shared-wrap">
            <div className="col-lg-8">
              <h1 className="h1__form__title">Tài khoản Đăng ký tài trợ</h1>
              <div>
                <h4 className="h__form__title mb-2">Mức tài trợ (VND)</h4>
                <div className="d-flex mb-4 gap-5">
                  <button
                    className={!amountIpState ? 'donate-amount-btn-active' : 'donate-amount-btn'}
                    onClick={() => {
                      setAmountIpState(false)
                      setAmount(300000)
                      setAmountInvalid(false)
                    }}
                  >
                    300.000 VND
                  </button>
                  <button
                    className={amountIpState ? 'donate-amount-btn-active' : 'donate-amount-btn'}
                    onClick={() => {
                      setAmountIpState(true)
                      setAmount(0)
                      setAmountInvalid(true)
                    }}
                  >
                    Mức khác
                  </button>
                  {amountIpState && (
                    <div>
                      <input
                        className="inp-donate-amount d-block"
                        type="number"
                        placeholder="0 VND"
                        value={amount}
                        onChange={handleAmountChange}
                      />
                      <span>
                        <small>
                          <i>Mức tài trợ tối thiểu là 100.000 vnd</i>
                        </small>
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h4 className="h__form__title mb-0">Chiến dịch tài trợ</h4>
                <span>
                  <small>
                    <i>
                      Nhấn vào
                      <NavLink to={'../donation/programs'}> liên kết này </NavLink>
                      để xem các chiến dịch tài trợ của chúng tôi và cách chúng tôi sử dụng khoản
                      tài trợ của bạn.
                    </i>
                  </small>
                </span>
                <div className="form-shared mt-1">
                  <form action="#">
                    <div className="form-group">
                      <CFormSelect
                        id=""
                        name="donation_purpose"
                        value={purposeId}
                        onChange={handlePurposeChange}
                      >
                        {donationPurposes.map((purpose, index) => (
                          <option value={purpose.donation_purpose_id} key={index}>
                            {purpose.purpose}
                          </option>
                        ))}
                      </CFormSelect>
                    </div>
                  </form>
                </div>
                {purposeId == DonationPurpose.familyDonate.code && (
                  <>
                    <h4 className="h__form__title mb-0">Chọn gia đình muốn tài trợ</h4>
                    <span>
                      <small>
                        <i>
                          Nhấn vào
                          <NavLink> liên kết này </NavLink>
                          để xem chi tiết về các gia đình trẻ trong trại trẻ của chúng tôi.
                        </i>
                      </small>
                    </span>
                    <div className="form-shared mt-1">
                      <form action="#">
                        <div className="form-group">
                          <CFormSelect
                            id="familySelect"
                            name="familySelect"
                            defaultValue={familyId}
                            value={familyId}
                            onChange={(e) => {
                              setFamilyId(e.target.value)
                            }}
                          >
                            {!familyId && <option value={''}>Chọn gia đình *</option>}
                            {families.map((family, index) => (
                              <option value={family.family_id} key={index}>
                                {family.family_name}
                              </option>
                            ))}
                          </CFormSelect>
                        </div>
                      </form>
                    </div>
                  </>
                )}
              </div>
              <div className="form-shared">
                <h3 className="h__form__title mb-2">Thông tin nhà tài trợ</h3>
                <small>
                  <i>Các trường đánh dấu * là bắt buộc phải nhập</i>
                </small>
                <form action="#">
                  <div className="row">
                    {inputs.map((input, index) => (
                      <div key={index} className={input.col ? 'col-lg-' + input.col : 'col-lg-12'}>
                        <div className="form-group">
                          <FormInput key={input.id} {...input} readOnly={readOnlyState} />
                        </div>
                      </div>
                    ))}
                    <div className="col-lg-12">
                      <div className="form-group">
                        <textarea
                          className="textarea h-auto"
                          name="message"
                          placeholder="Lời nhắn*"
                          value={message}
                          onChange={(e) => {
                            setMessage(e.target.value)
                          }}
                          rows={3}
                        ></textarea>
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <button
                        className="theme-btn submit__btn"
                        onClick={handleSubmit}
                        disabled={!formValid}
                      >
                        Tài trợ
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="sidebar-shared">
                <div className="fun-content p-4 border rounded-lg ">
                  <div className="section-heading mb-4">
                    <h4 className="section__desc">
                      Khoản tiền tài trợ của bạn, dù lớn hay nhỏ, đều quan trọng với chúng tôi trên
                      hành trình mang lại nụ cười và tương lai cho trẻ em mồ côi, bị bỏ rơi và có
                      hoàn cảnh đặc biệt khó khăn.
                    </h4>
                  </div>
                  <div className="fun-item fun-item1">
                    <img className="rounded-lg mb-3" src={donateImg1} alt="" />
                    <img className="rounded-lg mb-3" src={donateImg2} alt="" />
                    <img className="rounded-lg mb-3" src={donateImg3} alt="" />
                    <img className="rounded-lg" src={donateImg4} alt="" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default AccountDonationForm
