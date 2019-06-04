
# %%
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from folium import plugins
import folium
import numpy as np
import time
import pandas as pd
import plotly.plotly as py
import matplotlib.pyplot as plt
import plotly.graph_objs as go
import plotly.figure_factory as ff
import seaborn as sns
from plotly.offline import download_plotlyjs, init_notebook_mode, plot, iplot
import plotly.tools as tools


df = pd.read_json('data.json')

df.head()

numeric_cols = ['size', 'latitude', 'longitude',
                'price', 'postal_code', 'nbr_rooms']

for col in numeric_cols:
    df[col] = df[col].astype(float)

# Extra: We will create one additional column, "price per meter", which is simply normalized price by apartment size.
# df['price_per_meter'] = df['price'] / df['size']


# %%

df['price_rooms_rate'] = df.price / df.size


m = folium.Map([60.192059, 24.945831], zoom_start=12,
               tiles='Stamen Watercolor')

for i, row in df.iterrows():
    red = int((row.price_rooms_rate / df.price_rooms_rate.max()) * 255)

    green = 255 - red
    html = '#%02x%02x%02x' % (red, green, 0)  # convert rgb to html
    house_string = '{:.0f} - {:.0f}m2\n {}'.format(
        row.price, row['size'], row.address)
    marker = folium.CircleMarker(location=[row.latitude, row.longitude], radius=(
        row.nbr_rooms*5), color=html, fill=html, fill_opacity='0.3', popup=house_string)

    m.add_child(marker)


marker = folium.Marker(location=[60.192059, 24.945831])

m.add_child(marker)

m

# %%
# df['price_per_meter'] = df['price'] / df['size']


df = df.join(pd.get_dummies(df.postal_code))
df = df.join(pd.get_dummies(df.address))

df = df.drop(['postal_code', 'address'], axis=1)

X_train, x_test, Y_train, y_test = train_test_split(
    df.drop('price', axis=1), df.price)

model = RandomForestRegressor(n_estimators=50)

model.fit(X_train, Y_train)

# %%
pred = model.predict(x_test)

plt.figure(figsize=(20, 12))

plt.plot(range(0, y_test.shape[0]), y_test, marker='+')
plt.plot(range(0, pred.shape[0]), pred, marker='o')

model.score(x_test, y_test)

# %%

important_features_dict = {}
for x, i in enumerate(model.feature_importances_):
    important_features_dict[x] = i


important_features_list = sorted(important_features_dict,
                                 key=important_features_dict.get,
                                 reverse=True)

print('Most important features: {}', important_features_list[:15])

feature_importances = {}

i = 0

for feat, importance in zip(df.columns, important_features_list):

    print('feature: {f}, importance: {i}'.format(f=feat, i=importance))

# for item in important_features_list[:15]:

#     feature_importances[i] = X_train.columns[item]
#     i = i+1
