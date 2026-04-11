# RoutinCare FE

Frontend project cho RoutinCare, su dung React + Vite.

## Run project

Yeu cau:
- Node.js 18+
- npm 9+

Lenh chay:

```bash
npm install
npm run dev
```

Build production:

```bash
npm run build
npm run preview
```

Lint:

```bash
npm run lint
```

## API docs

- Backend REST specification: [docs/Api Specification](docs/Api%20Specification)
- FE request/response contract: [docs/FE_API_REQUEST_RESPONSE.md](docs/FE_API_REQUEST_RESPONSE.md)
- FE connected vs backend coverage matrix: [docs/FE_BACKEND_API_COVERAGE.md](docs/FE_BACKEND_API_COVERAGE.md)

## Update moi trong tai lieu

- Da bo sung tai lieu doi chieu endpoint FE da noi voi backend specification.
- Tai lieu moi giup nhin nhanh endpoint nao da co wrapper o FE, endpoint nao chua co, va endpoint nao can chuan hoa route.

## UI update

- Da them wrapper `GET /api/users/me/following/routines` trong `src/api/userApi.jsx`.
- `UserHeader` duoc cap nhat de dong bo lai so lieu social (following/followers) tu endpoint tren neu backend tra ve counters; neu khong co counters thi fallback ve logic hien tai.
- Chinh `#root` ve full-width trong `src/index.css` (bo width co dinh 1126px) de man hinh login/signup phu kin background, khong con vien den 2 ben.
- Da them `src/api/feedApi.jsx` voi cac wrappers: `GET /api/feed`, `GET /api/explore`, `GET /api/explore/routines`, `GET /api/explore/users`.
- Trang Home `src/page/customer/home/HomePage.jsx` da ket noi du lieu that cho Feed + Explore, co loading state, error state (retry), empty state va giao dien tab chuyen doi `Theo doi`/`Kham pha`.
- `src/components/FeedPost.jsx` da duoc lam robust hon cho payload backend (fallback khi thieu anh, user, like/comment/share counters).
- Home page da duoc harden luong goi API: neu 1 endpoint feed/explore loi thi cac endpoint con lai van hien thi; co fallback sang `GET /api/explore` khi `explore/routines` va `explore/users` khong san sang.
- Feed card tren Home da duoc doi ve layout hinh chu nhat (card style) thay vi khoi dung cao kieu reel/story.
- Header Home da duoc doi sang nen gradient den va mo dan o phan cuoi de chuyen tiep mem hon voi noi dung feed.
- Da polish lai tong the Home: dong bo max-width voi bottom nav, tang khoang trong duoi de nav khong de len card, va chuyen FeedPost sang bottom-info panel + action ngang de card gon va de nhin hon.
- Da them `src/api/postApi.jsx` voi day du wrappers cho Posts/Comments/Likes (gom ca admin delete post/comment).
- Home tab `Theo doi` da chuyen sang du lieu `GET /api/posts` va ho tro truc tiep: like post, mo comment, tao comment, sort comment (`Moi nhat`, `Cu nhat`, `Nhieu like`).
- Da cap nhat lai `docs/FE_BACKEND_API_COVERAGE.md` de phan anh module Feed/Explore va Posts/Comments/Likes da duoc FE noi day du.
- Da bo tri lai Home theo layout gan Instagram: header logo ben trai, cum icon Search/Thong bao/Tin nhan ben phai, tab navigation theo kieu line-indicator o ngay duoi header.
- Da fix overlap giua header fixed va noi dung feed bang cach tang top spacing cua `main`.
- Da fix vi tri `BottomNav` bang canh giua transform (`left-1/2` + `-translate-x-1/2`) de khong bi lech trai tren man hinh rong.
- Da dong bo nen `UserHeader` theo cung gradient voi Home (`radial-gradient`) de giao dien profile nhat quan hon.
- Da cap nhat `BottomNav` theo huong Instagram: tren desktop (`md+`) hien thanh dieu huong doc sat ben trai man hinh; tren mobile van giu bottom tab de toi uu thao tac.
- Da bo header tren HomePage; cac action Search/Thong bao/Tin nhan duoc dua vao `BottomNav`.
- Tren desktop sidebar, khi hover vao icon se hien tooltip text (Home, Search, Notifications, Plan, Chat) de de nhan biet chuc nang.
- Da nang cap sidebar desktop theo kieu mo rong khi hover (86px -> 220px), hien label truc tiep ben canh icon thay vi tooltip noi.
- Da tang toc do animation sidebar hover-expand (giam transition duration) de text va panel hien ra nhanh hon.
- Da gan su kien cho logo sidebar: bam vao logo se dieu huong ve trang Home.
- Da them fix cho loi `404` o Posts Like/Comment: `postApi` co route-casing fallback (`/api/posts` <-> `/api/Posts`) va Home se khoa tuong tac tren item fallback tu `/feed` de tranh goi sai endpoint.
- Da cai thien mapping thong tin tac gia post o Home (name/avatar): bo sung nhieu alias field backend (camelCase + snake_case) va fallback dung du lieu user hien tai cho bai cua chinh minh, giam truong hop hien `Routin User` sai avatar.
- Da bo sung nut `Xem them` trong desktop sidebar (`BottomNav`); menu ben trong hien hanh dong `Dang xuat` va dung chung flow logout an toan (goi API logout neu co refresh token, sau do clear auth local).
- Da dieu chinh menu `Xem them` tren desktop mo len phia tren nut (upward dropdown) de de thay noi dung va tranh bi cat o cuoi man hinh.
- Da fix loi menu `Xem them` khi sidebar dang co (collapsed): menu `Dang xuat` co do rong co dinh, khong bi xuong dong bat thuong va tu dong dong khi re chuot ra khoi sidebar.
- Da cai thien do on dinh cho like/comment o Home: `postApi` se thu fallback route khi gap `404` hoac `405`, va post tu fallback feed neu co `id` backend hop le thi van cho phep tuong tac.
- Da bo sung thong bao loi ro rang khi like/comment that bai (thay vi chi log trong console) de de theo doi nguyen nhan.
- Da go bo tinh nang tuong tac `like/comment` khoi Home theo yeu cau hien tai; feed tren Home chi hien thi noi dung o che do read-only (xem post + counters), khong goi API like/comment nua.
- Da go tiep toan bo UI tuong tac con lai tren card feed Home (avatar/name link, bookmark button), card hien tai la read-only hoan toan.
- Da bo hẳn cum thao tac UI/UX cho `like/comment/share` tren card feed Home; card chi con caption + thong tin thoi gian dang bai.
- Da them nut `Copy routine` tren card feed Home; FE se goi `POST /api/Routines/:id/copy` khi post co `routineId` hop le, co loading state va thong bao ket qua.
- Da fix luong `Copy routine` tren Home: bo sung mapping nhieu alias routine id tu payload post/feed (`routineId`, `originalRoutineId`, `sourceRoutineId`, nested `routine.*`, ...), kem fallback cho item dang routine entity.
- Da fix so task tren trang `Your Routine`: bo sung map nhieu alias field task count va fallback goi `GET /api/Routines/:id` cho routine thieu du lieu trong list, giup hien thi so task chinh xac hon.
- Da fix loi cap nhat gio nhac (`remindTime`) o trang chi tiet routine: chuan hoa format gio truoc khi submit (`HH:mm` -> `HH:mm:ss`) de backend parse TimeSpan dung, tranh loi `400 Bad Request`.
- Da tang khoang trong day trang Routine Detail (`pb-36` tren mobile) de section Tasks khong bi BottomNav che.
- Da fix tinh trang desktop sidebar che noi dung o Routine Detail bang cach them offset trai tren man hinh `md+` (`md:pl-[96px]`).
