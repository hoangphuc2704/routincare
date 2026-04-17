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
- Da bo sung popup `Xem truoc routine` truoc khi copy tren Home: khi bam `Copy routine`, FE goi `GET /api/Routines/:id` de hien thi title/mo ta/metadata/day du task + prepare items, nguoi dung xac nhan moi thuc hien `POST /api/Routines/:id/copy`.
- Da polish noi dung popup xem truoc routine sang tieng Viet co dau de de hieu hon trong UX (`Xem truoc routine`, `Huy`, `Xac nhan copy`, ...).
- Popup xem truoc routine da ho tro hien thi anh cover neu backend tra ve (`coverImageUrl`/`thumbnailUrl`/`imageUrl`), fallback ve anh tu card feed/explore neu can.
- Da tach popup thanh component tai su dung `src/components/RoutinePreviewModal.jsx`; Home Feed va Explore routines dang dung chung mot luong preview + xac nhan copy.
- Da redesign modal theo visual cua Home (dark gradient + accent `#d2fb05`, card border `white/10`) de dong bo layout/mau sac voi trang.
- Da fix xung dot style AntD Modal o popup routine preview bang class-based CSS override (thay vi phu thuoc inline styles), dam bao modal luon len dung dark-theme theo Home tren moi moi truong.
- Da cap nhat them cho AntD v6: popup routine preview dung semantic `classNames/styles` + `rootClassName`, kem CSS specificity cao (`!important`) de tranh bi token mac dinh ghi de nen trang.
- Da chuyen popup routine preview sang custom modal overlay (portal vao `document.body`) de loai bo xung dot theme token cua AntD, dam bao layout/mau dark on dinh 100% theo Home.
- Da fix luong `Copy routine` tren Home: bo sung mapping nhieu alias routine id tu payload post/feed (`routineId`, `originalRoutineId`, `sourceRoutineId`, nested `routine.*`, ...), kem fallback cho item dang routine entity.
- Da fix so task tren trang `Your Routine`: bo sung map nhieu alias field task count va fallback goi `GET /api/Routines/:id` cho routine thieu du lieu trong list, giup hien thi so task chinh xac hon.
- Da fix loi cap nhat gio nhac (`remindTime`) o trang chi tiet routine: chuan hoa format gio truoc khi submit (`HH:mm` -> `HH:mm:ss`) de backend parse TimeSpan dung, tranh loi `400 Bad Request`.
- Da tang khoang trong day trang Routine Detail (`pb-36` tren mobile) de section Tasks khong bi BottomNav che.
- Da fix tinh trang desktop sidebar che noi dung o Routine Detail bang cach them offset trai tren man hinh `md+` (`md:pl-[96px]`).
- Da fix hien thi sai trang thai Public/Private sau khi cap nhat routine: FE da normalize enum `visibility` (va `repeatType`) cho ca gia tri so, numeric-string (`"0"`, `"1"`) va enum-string (`"Private"`, `"Public"`, `"Daily"`, `"Weekly"`), tranh fallback nham ve `Public`.
- Da fix hien thi tong so task bi sai o trang routine: FE nay resolve duoc task list tu nhieu response shape (array truc tiep hoac object boc `items`/`results`/`data`/`$values`) nen `tasks.length` va badge task count da dung hon.
- Da cap nhat mapping ten nguoi tao routine tren feed Home: FE uu tien cac field moi tu backend nhu `creatorNamee`/`creatorName` (kem avatar/id creator aliases) de hien thi dung tac gia routine.
- Da bo sung them mapping nested cho ten creator trong payload routine (`routine.creatorNamee`, `routine.creatorName`, creator object trong routine) de dam bao bai cua nguoi khac hien dung ten.
- Da fix 3 van de tren trang Routine Detail: (1) check-in xong nhung status van hien `InProgress` do enum string/number khac nhau; FE da normalize status linh hoat, (2) upload minh chung bang file anh da doi sang signed-upload + URL (khong gui base64), (3) task prepare-items da duoc normalize nhieu response shape/task id nen luu xong se refresh va hien thi dung.
- Da bo sung va fix nhom chuc nang Task trong Routine Detail: co nut `Sua task`/`Xoa task` tren tung task, chan check-in lan 2 neu task da `Completed` (khong bi toggle status ngoai y muon), va hien thi minh chung da upload (preview anh neu la image URL, fallback link neu khong phai image).
- Da tach state theo tung task card trong Routine Detail (log input, evidence input, prepare-item draft) bang task state key rieng, giup moi task hoat dong doc lap va khong con bi dinh du lieu khi thao tac song song.
- Da cap nhat bo cuc danh sach task trong Routine Detail sang dang 2 cot tren man hinh desktop/tablet de Task A, Task B hien thi canh nhau, de so sanh va thao tac nhanh hon.
- Da toi uu lai Routine Detail theo feedback UI: khu vuc Task su dung full-width container (tranh bi ep/chong cheo tren desktop), task list tro ve 1 cot de card khong bi meo, va bo sung popup `Xem popup` de xem nhanh chi tiet tung task (status, target, evidence, prepare items).
- Da redesign task list theo huong Instagram feed de scale tot voi 10+ tasks: co summary chips, tim kiem task theo ten, loc theo trang thai (`All/InProgress/Completed/Skipped`), toggle che do `Grid/List`, va co nut `Mo rong/Thu gon` tung card de tranh trang qua dai.
- Da don dep code cho trang Saved feed [MyFeedsSavedPage]: tach data mau thanh constant rieng, doi key map on dinh (khong dung index), bo sung empty state, va giu JSX gon de de mo rong khi ket noi API that.
- Da giam do phuc tap cua cac trang lon bang cach tach helper/util ra file rieng:
	- Home: tach toan bo helper mapping/feed normalize sang `src/page/customer/home/utils/homePageHelpers.js` (file page giam manh, de doc hon).
	- Profile: tach helper subscription/analytics/format sang `src/page/customer/profile/utils/profileHelpers.js`.
	- Subscription: tach helper status/currency/date/cancel flow sang `src/page/customer/subscription/utils/subscriptionHelpers.js`.
	- Routine Detail: tach helper chung sang `src/page/customer/selfrRoutin/utils/routineDetailHelpers.js` va tach popup task sang `src/page/customer/selfrRoutin/components/TaskPreviewModal.jsx`.
- Da tiep tuc refactor Routine Detail (vong 2): tach khoi JSX lon ra cac component con `src/page/customer/selfrRoutin/components/TaskCard.jsx`, `src/page/customer/selfrRoutin/components/TaskActions.jsx`, `src/page/customer/selfrRoutin/components/PrepareItemEditor.jsx`, `src/page/customer/selfrRoutin/components/NewTaskForm.jsx`; `RoutineDetailPage.jsx` gio chu yeu dieu phoi state/handler va da giam kich thuoc dang ke.
- Da tiep tuc refactor Routine Detail (vong 3): tach them section `Tasks` va section `Prepare items` cua routine thanh `src/page/customer/selfrRoutin/components/TaskSection.jsx` va `src/page/customer/selfrRoutin/components/RoutinePrepareSection.jsx`; `RoutineDetailPage.jsx` giam xuong con ~940 dong va van build thanh cong.
- Da tiep tuc clean-up theo huong tach screen: `src/page/customer/profile/Profile.jsx` duoc tach thanh cac man hinh con `src/page/customer/profile/components/DashboardScreen.jsx`, `src/page/customer/profile/components/RoutinesScreen.jsx`, `src/page/customer/profile/components/SettingsScreen.jsx`; file page chinh giam tu ~852 dong con ~507 dong, build pass.
- Da fix loi "Them vat dung cho task khong luu" tren Routine Detail: dong bo key draft giua `taskStateKey` va `taskId` trong `handleTaskPrepareAdd` + `PrepareItemEditor`, tranh truong hop bam them nhung payload doc sai bucket state nen khong persist du lieu.
- Da cap nhat UI Routine Detail theo feedback moi:
	- Bo form "Them vat dung" o section Prepare items ben ngoai (chi giu danh sach item va thao tac xoa).
	- Thay form them task co dinh bang nut `Them task` o header section Tasks; bam nut moi mo/thu gon form.
	- Dua form "Chinh sua routine" vao ben trong card thong tin routine va hien/an bang nut `Chinh sua routine`.
- Da bo han section `Prepare items` ben ngoai tren Routine Detail (khong con hien block nay trong man hinh), chi giu luong prepare item theo tung task.
- Da xoa file component khong con su dung `src/page/customer/selfrRoutin/components/RoutinePrepareSection.jsx` de codebase gon hon va tranh dead code.
