# Bài Khảo Sát Năng Lực: Web3 & AI Vibe Coding

---

## Phần 1: System Design & Prompt Engineering

### Chuỗi Prompt Chi Tiết

Dưới đây là chuỗi prompt được thiết kế để tạo ra bộ khung code chuẩn xác, an toàn và tối ưu gas cho dự án "Báo Trắng" NFT.

---

#### Prompt 1: Khởi tạo Smart Contract

```
Hãy tạo một Smart Contract Solidity (phiên bản ^0.8.20) cho bộ sưu tập NFT "White Panther" (Báo Trắng)
triển khai trên mạng Arbitrum với các yêu cầu CHÍNH XÁC sau:

## Thông số kỹ thuật:
- Standard: ERC-721 (sử dụng OpenZeppelin v5 contracts)
- Tên collection: "White Panther"
- Symbol: "WPNFT"
- Max supply: 10,000 NFTs
- Thanh toán bằng token ERC-20 (address được set bởi owner khi deploy)
- Mint price: configurable bởi owner

## Chức năng bắt buộc:
1. `mint(uint256 quantity)` - Cho phép user mint 1 hoặc nhiều NFT, thanh toán bằng ERC-20 token.
   Trước khi gọi mint, user phải approve ERC-20 token cho contract.
   Sử dụng `safeTransferFrom` của ERC-20 để kéo token từ user.
2. `setMintPrice(uint256 newPrice)` - Owner thay đổi giá mint (onlyOwner)
3. `setPaymentToken(address token)` - Owner thay đổi token thanh toán (onlyOwner)
4. `setBaseURI(string memory uri)` - Owner set metadata base URI (onlyOwner)
5. `withdrawTokens()` - Owner rút toàn bộ ERC-20 token về ví của mình (onlyOwner)
6. `pause()` / `unpause()` - Owner tạm dừng/mở lại mint (onlyOwner)

## Yêu cầu bảo mật & tối ưu:
- Sử dụng ReentrancyGuard của OpenZeppelin cho mọi hàm có transfer token
- Sử dụng Pausable của OpenZeppelin
- Sử dụng Ownable của OpenZeppelin
- Check-Effects-Interactions pattern ở MỌI hàm
- Sử dụng custom errors thay vì require strings để tiết kiệm gas
- Sử dụng unchecked block cho các phép tính không thể overflow (ví dụ: loop counter)
- Sử dụng `_safeMint` thay vì `_mint`
- Event cho mọi state change quan trọng

## Cấu trúc project:
- Sử dụng Hardhat framework
- Config mạng Arbitrum One và Arbitrum Sepolia (testnet)
- Viết deployment script
- Viết unit test cơ bản bằng Hardhat + Chai + ethers.js v6

Vui lòng tạo đầy đủ các file: contract, deploy script, hardhat config, và test file.
```

---

#### Prompt 2: Khởi tạo Frontend Web3

```
Tạo giao diện Web3 frontend cho dự án NFT "White Panther" với các yêu cầu sau:

## Tech stack:
- Vite + React + TypeScript
- ethers.js v6 (QUAN TRỌNG: dùng v6, KHÔNG dùng v5)
- CSS Modules hoặc styled-components

## Chức năng:
1. Nút "Connect Wallet" kết nối MetaMask
   - Hiển thị địa chỉ ví đã kết nối (rút gọn: 0x1234...abcd)
   - Tự động kiểm tra và yêu cầu chuyển sang mạng Arbitrum nếu user đang ở chain khác
   - Handle các trường hợp: MetaMask chưa cài, user từ chối kết nối, đổi account

2. Khu vực Mint:
   - Hiển thị giá mint hiện tại (đọc từ contract)
   - Hiển thị số NFT đã mint / tổng supply
   - Input chọn số lượng NFT muốn mint (1-10)
   - Nút "Approve" để approve ERC-20 token cho contract
   - Nút "Mint" để gọi hàm mint
   - Hiển thị trạng thái giao dịch: pending, success, failed

3. UX/UI:
   - Design tối giản, chuyên nghiệp, dark theme
   - Responsive (mobile-first)
   - Loading states và error handling rõ ràng
   - Toast notifications cho các transaction events

## Lưu ý quan trọng về ethers.js v6:
- Dùng `ethers.BrowserProvider` (KHÔNG dùng `ethers.providers.Web3Provider`)
- Dùng `provider.getSigner()` trả về Promise (phải await)
- Dùng `ethers.Contract(address, abi, signer)`
- Dùng `ethers.parseUnits()` thay `ethers.utils.parseUnits()`
- Dùng `ethers.formatUnits()` thay `ethers.utils.formatUnits()`

Tạo đầy đủ các file components, hooks, và config.
```

---

#### Prompt 3: Review & Hardening

```
Hãy review lại toàn bộ code vừa tạo và kiểm tra:

1. Smart Contract:
   - Có lỗ hổng reentrancy nào không?
   - Có thiếu access control ở hàm nào không?
   - Có integer overflow/underflow risk nào không?
   - Gas optimization: có chỗ nào dùng storage không cần thiết không?

2. Frontend:
   - Có handle đúng tất cả error cases không?
   - ethers.js syntax có đúng v6 không? (Kiểm tra từng dòng)
   - Có memory leak nào từ event listeners không?

Liệt kê mọi issue tìm được và sửa ngay.
```

---

## Phần 2: AI Code Audit & Security Fix

### 2.1 Phân tích lỗ hổng

Đoạn code chứa lỗ hổng **Reentrancy Attack** (Tấn công Tái-nhập) — một trong những lỗ hổng kinh điển và nguy hiểm nhất trong smart contract, nổi tiếng từ vụ hack **The DAO năm 2016** (thiệt hại ~60 triệu USD).

#### Cơ chế lỗi:

```solidity
function withdraw() public {
    uint bal = balances[msg.sender];
    require(bal > 0, "No balance to withdraw");

    // ❌ BUG: Gửi ETH TRƯỚC khi cập nhật balance
    (bool sent, ) = msg.sender.call{value: bal}("");
    require(sent, "Failed to send Ether");

    // ❌ Dòng này chạy SAU khi gửi ETH → quá muộn!
    balances[msg.sender] = 0;
}
```

**Vấn đề cốt lõi:** Balance của user được cập nhật **SAU** khi gửi ETH. Dòng `msg.sender.call{value: bal}("")` sẽ trigger hàm `receive()` hoặc `fallback()` của contract kẻ tấn công. Trong hàm đó, kẻ tấn công gọi lại `withdraw()` lần nữa — lúc này `balances[msg.sender]` **vẫn chưa bị reset về 0**, nên `require(bal > 0)` vẫn pass. Vòng lặp tiếp tục cho đến khi hút cạn toàn bộ ETH trong contract.

#### Hậu quả:

| Hậu quả                 | Mô tả                                                                 |
| ----------------------- | --------------------------------------------------------------------- |
| **Mất toàn bộ ETH**     | Kẻ tấn công rút **toàn bộ** ETH trong contract, không chỉ phần của họ |
| **Ảnh hưởng user khác** | Tất cả user khác mất tiền vì contract đã bị rút sạch                  |
| **Không thể đảo ngược** | Trên blockchain, giao dịch không thể rollback                         |

#### Minh họa luồng tấn công:

```
Attacker Contract                    Victim Contract
     │                                     │
     ├── withdraw() ──────────────────────►│ bal = 1 ETH ✓
     │                                     │ send 1 ETH ──►│
     │◄── receive() nhận 1 ETH ◄───────── │                │
     │                                     │ (balances vẫn = 1 ETH!)
     ├── withdraw() LẦN 2 ───────────────►│ bal = 1 ETH ✓ (chưa reset!)
     │                                     │ send 1 ETH ──►│
     │◄── receive() nhận thêm 1 ETH ◄──── │                │
     │         ... lặp lại ...             │                │
     │                                     │ Contract: 0 ETH 💀
```

---

### 2.2 Prompt để AI tự sửa lỗi

```
Đoạn code withdraw() dưới đây đang có lỗ hổng Reentrancy Attack nghiêm trọng.
Balance được cập nhật SAU khi gửi ETH, cho phép kẻ tấn công gọi lại withdraw()
trong fallback function trước khi balance bị reset.

[paste code gốc ở đây]

Hãy fix bằng cách áp dụng CẢ HAI biện pháp sau (defense in depth):

1. **Checks-Effects-Interactions pattern**:
   Đặt `balances[msg.sender] = 0` TRƯỚC dòng `msg.sender.call{value: bal}("")`

2. **ReentrancyGuard**:
   Import và sử dụng modifier `nonReentrant` từ OpenZeppelin

Trả về code đã fix hoàn chỉnh.
```

#### Code đã được vá (Expected Output):

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SecureWallet is ReentrancyGuard {
    mapping(address => uint) public balances;

    function withdraw() public nonReentrant {
        uint bal = balances[msg.sender];
        require(bal > 0, "No balance to withdraw");

        // ✅ Effects: Cập nhật state TRƯỚC
        balances[msg.sender] = 0;

        // ✅ Interactions: Gửi ETH SAU
        (bool sent, ) = msg.sender.call{value: bal}("");
        require(sent, "Failed to send Ether");
    }
}
```

**Giải thích 2 lớp bảo vệ:**

| Lớp                 | Cơ chế                                | Tác dụng                                                    |
| ------------------- | ------------------------------------- | ----------------------------------------------------------- |
| **CEI Pattern**     | Reset balance **trước** khi gửi ETH   | Ngay cả khi bị gọi lại, `bal = 0` → `require` fail          |
| **ReentrancyGuard** | Modifier `nonReentrant` lock function | Nếu bị gọi lại trong cùng transaction → revert ngay lập tức |

---

## Phần 3: Xử lý Ảo giác của AI (Hallucination Handling)

### Workflow chống Hallucination cho ethers.js v6

Khi AI liên tục generate code ethers.js v5 thay vì v6, đây là quy trình 4 bước để "ép" AI viết đúng:

---

### Bước 1: Cung cấp Context rõ ràng trong System Prompt / Đầu cuộc hội thoại

```
QUAN TRỌNG - QUY TẮC BẮT BUỘC:
Dự án này sử dụng ethers.js v6. KHÔNG ĐƯỢC sử dụng syntax của v5.

Bảng mapping v5 → v6 bắt buộc tuân theo:
| ❌ v5 (CẤM DÙNG)                      | ✅ v6 (BẮT BUỘC)                    |
|----------------------------------------|--------------------------------------|
| ethers.providers.Web3Provider          | ethers.BrowserProvider               |
| ethers.providers.JsonRpcProvider       | ethers.JsonRpcProvider               |
| ethers.utils.parseEther()              | ethers.parseEther()                  |
| ethers.utils.formatEther()             | ethers.formatEther()                 |
| ethers.utils.parseUnits()              | ethers.parseUnits()                  |
| ethers.utils.formatUnits()             | ethers.formatUnits()                 |
| ethers.utils.id()                      | ethers.id()                          |
| ethers.BigNumber.from()                | Dùng native BigInt                   |
| provider.getSigner() (sync)            | await provider.getSigner() (async)   |
| contract.filters.EventName()           | contract.filters.EventName()         |
| ethers.constants.AddressZero           | ethers.ZeroAddress                   |
| ethers.constants.MaxUint256            | ethers.MaxUint256                    |

Nếu bạn viết bất kỳ syntax v5 nào, code sẽ KHÔNG CHẠY ĐƯỢC.
```

---

### Bước 2: Cung cấp Reference Code mẫu

````
Đây là ví dụ code ethers.js v6 ĐÚNG CHUẨN để bạn tham khảo:

```typescript
import { ethers } from "ethers";

// Kết nối MetaMask
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const address = await signer.getAddress();

// Đọc contract
const contract = new ethers.Contract(contractAddress, abi, signer);
const balance = await contract.balanceOf(address);

// Parse/Format
const amount = ethers.parseUnits("100", 18);
const formatted = ethers.formatUnits(balance, 18);

// Send transaction
const tx = await contract.mint(1, { value: ethers.parseEther("0.05") });
const receipt = await tx.wait();
````

Tất cả code bạn viết PHẢI tuân theo style trên. Hãy viết lại toàn bộ file [tên file]
theo ethers.js v6.

````

---

### Bước 3: Gate-check sau mỗi output

Sau khi AI trả code, chạy lệnh grep nhanh để verify:

```bash
# Kiểm tra xem AI có dùng syntax v5 không
grep -rn "providers.Web3Provider\|utils.parseEther\|utils.formatEther\|utils.parseUnits\|utils.formatUnits\|BigNumber.from\|constants.AddressZero\|constants.MaxUint256" src/

# Nếu grep trả về kết quả → AI vẫn hallucinate → chạy Bước 4
````

Hoặc nhờ chính AI tự kiểm tra:

```
Hãy kiểm tra lại toàn bộ code vừa viết.
Scan từng dòng và liệt kê tất cả chỗ nào ĐANG dùng syntax ethers.js v5.
Tôi muốn output là bảng gồm: [file, dòng, code sai v5, code đúng v6].
Sau đó tự sửa lại.
```

---

### Bước 4: Fallback — Pin documentation chính thức

Nếu AI vẫn tiếp tục sai, cung cấp trực tiếp documentation:

```
Đọc migration guide chính thức từ ethers.js:
https://docs.ethers.org/v6/migrating/

Dựa HOÀN TOÀN vào tài liệu này, viết lại file [tên file cần sửa].
KHÔNG được sử dụng kiến thức cũ của bạn — chỉ dùng syntax từ tài liệu v6 trên.

Trước khi trả code, hãy tự kiểm tra lại từng import, từng function call,
đảm bảo 100% compatible với ethers v6.
```

---

### Tóm tắt Workflow:

```
┌─────────────────────────────────────────────────┐
│  1. Set Context: Bảng mapping v5→v6 trong prompt│
│                    ↓                            │
│  2. Provide Reference: Code mẫu v6 chính xác   │
│                    ↓                            │
│  3. Gate-check: Grep hoặc AI self-review        │
│         ↓ (nếu vẫn sai)                        │
│  4. Pin Docs: Link docs chính thức + ép AI      │
│     chỉ dùng docs, không dùng kiến thức cũ     │
└─────────────────────────────────────────────────┘
```

**Nguyên tắc cốt lõi:** AI hallucinate khi thiếu context cụ thể. Cách chống hiệu quả nhất là **cung cấp bảng mapping rõ ràng** + **code mẫu đúng** + **tự động kiểm tra output** thay vì chỉ nói "hãy dùng v6".
