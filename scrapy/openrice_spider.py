import scrapy
import json

class OpenriceSpider(scrapy.Spider):
	name = 'openrice'
	allowed_domains = ['www.openrice.com']


	def start_requests(self):
		headers = {
			'accept-encoding': 'gzip, deflate, sdch, br',
			'accept-language': 'en-US,en;q=0.8,zh-CN;q=0.6,zh;q=0.4',
			'upgrade-insecure-requests': '1',
			'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
			'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
			'cache-control': 'max-age=0',
		}
		# your code here
		global global_list
		global_list=list()

		global counter
		counter = 0

		global total

		text_file = open("openrice_urls.txt", "r", encoding='utf8')
		lines = text_file.read().split('\n')[:-1]
		total = len(text_file.read().split('\n'))-1

		for url in lines:
			yield scrapy.Request(url=url, headers=headers, callback=self.parse)

	def parse(self, response):

		#name
		name_selector = "div.poi-name>h1"
		name_text_selector = "span/text()"
		name = response.css(name_selector).xpath(name_text_selector).extract_first()
		#cuisine
		cuisine_selector = "div.header-poi-categories.dot-separator>div"
		cuisine_text_selector = "a/text()"
		cuisine = response.css(cuisine_selector).xpath(cuisine_text_selector).extract()
		#price-range
		price_range_selector = "div.header-poi-price.dot-separator"
		price_range_text_selector = "a/text()"
		price_range = response.css(price_range_selector).xpath(price_range_text_selector).extract_first()
		#data-latitude
		lat_selector = "div.mapview-warper.js-mapview-warper>div.mapview-container#poi-mapview-container"
		lat_text_selector = "@data-latitude"
		lat = response.css(lat_selector).xpath(lat_text_selector).extract_first()
		#data-longitude
		lng_selector = "div.mapview-warper.js-mapview-warper>div.mapview-container#poi-mapview-container"
		lng_text_selector = "@data-longitude"
		lng = response.css(lng_selector).xpath(lng_text_selector).extract_first()
		latlng = [lat, lng]
		#rating
		rating_selector = "div.header-score"
		rating_text_selector = "text()"
		rating = response.css(rating_selector).xpath(rating_text_selector).extract_first()
		#reviews
		reviews_selector = "div.header-smile-section"
		reviews_text_selector = "div/text()"
		reviews = response.css(reviews_selector).xpath(reviews_text_selector).extract()
		#district
		district_selector = "div.header-poi-district.dot-separator"
		district_text_selector = "a/text()"
		district = response.css(district_selector).xpath(district_text_selector).extract_first()

		#address
		address_selector = "div.address-info-section>div.content>a"
		address_text_selector = "text()"
		address = response.css(address_selector).xpath(address_text_selector).extract_first()
		address.replace("\n","")
		address.replace("\r","")
		address = address.strip()
		#mtr
		mtr_selector = "section.transport-section>div.content.js-text-wrapper"
		mtr_text_selector = "text()"
		mtr = response.css(mtr_selector).xpath(mtr_text_selector).extract_first()
		if (isinstance(mtr, str)):
			mtr.replace("\n","")
			mtr.replace("\r","")
			mtr = mtr.strip()
		#pic
		pic_selector = "div.door-photo-section>a>div.photo"
		pic_text_selector = "@style"
		pic_url = response.css(pic_selector).xpath(pic_text_selector).extract_first()
		
		if (isinstance(pic_url, str)):
			pic_url = pic_url.split('(', 1)[-1].split(')')[0]

		
		if len(price_range.split("$")[-1].split("-")) >1:
			price_range = "$"+str((int(price_range.split("$")[-1].split("-")[1])+int(price_range.split("$")[-1].split("-")[0]))/2)
		else:
			price_range = "$"+price_range.split("$")[-1]
		
		global global_list
		global counter
		global total
		global_list.append(({"name":name,"cuisine":cuisine,"price":price_range,"location":{"latitude": float(latlng[0]), "longitude": float(latlng[1])} ,"rating":rating,"reviews":reviews,"district":district,"url":response.url,"address":address,"mtr":mtr, "pic":pic_url}))
		output_filename = 'openrice_data.json'
		counter+=1
		if (counter>=total):
			with open(output_filename, 'w') as output_file:
				output_file.write(json.dumps(global_list, indent=4, ensure_ascii = False))
