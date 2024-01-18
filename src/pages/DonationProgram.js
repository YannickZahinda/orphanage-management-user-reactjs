import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { donationApi } from 'src/api/services'
import Programs from 'src/components/donation/Programs'
import img from 'src/assets/images/z469424984074078a985e8039caf8bfb595908a99e41a0-16947631833561260439514.jpg'
const DonationProgramPage = () => {
  return (
    <>
      <section className="donation-banner-area" style={{ backgroundImage: 'url(' + img + ')' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="section-heading mixer-heading z-100 text-center pl-5 pr-5">
              <h1 className="text__white mb-3">Chiến dịch tài trợ</h1>
              <h4 className="text__white">
                Chúng tôi cam kết đảm bảo mọi đồng bào đều có quyền lợi được sống và phát triển. Mỗi
                đóng góp của bạn sẽ là bước chuyển mình lớn trong việc xây dựng một tương lai tươi
                sáng cho những trái tim nhỏ bé.
              </h4>
            </div>
          </div>
        </div>
      </section>
      <Programs />
    </>
  )
}
export default DonationProgramPage
